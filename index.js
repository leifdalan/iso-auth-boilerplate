import path from 'path';
import express from 'express';
import session from 'express-session';
import favicon from 'serve-favicon'
import compress from 'compression';
import proxy from 'proxy-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import serialize from 'serialize-javascript';
import nodeDebug from 'debug';
import flash from 'connect-flash';
import morgan from 'morgan';
import mongoose from 'mongoose';
import url from 'url';
import routes from './shared/routes';
import CONSTANTS from './shared/constants';

// React goodness
import React from 'react';
import Router from 'react-router';
import {loginAction, logoutAction} from './shared/actions/authActions';
import navigateAction from './shared/actions/navigate';
import app from './shared/app';
import Html from './shared/components/Html';

const htmlComponent = React.createFactory(Html);

// Passport imports
import passport from 'passport';
import passportConfig from './config/passport';
import config from './config';

const debug = nodeDebug('Server');

mongoose.connect(config.url);

passportConfig(passport);

const server = express();
const PORT = process.env.PORT || 3030;

debug('Environment Variables:');
debug('REACT_CLIENT_RENDER:', process.env.REACT_CLIENT_RENDER);
debug('REACT_SERVER_RENDER:', process.env.REACT_SERVER_RENDER);

// ----------------------------------------------------------------------------
// Express middleware (order matters!)
// ----------------------------------------------------------------------------

// log every request to the console
server.use(morgan('dev'));

// read cookies (needed for auth)
server.use(cookieParser());

// get information from html forms
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// required for passport
// session secret
server.use(session({
  secret: 'asdfoijwefobouz23oiv',
  resave: true,
  saveUninitialized: true
}));
server.use(passport.initialize());

// persistent login sessions
server.use(passport.session());

// use connect-flash for flash messages stored in session
server.use(flash());

// load our routes and pass in our app and fully configured passport
routes(server, passport);

// Proxy public folder to WebPack's hot loading server during development
if (process.env.NODE_ENV === 'development' &&
  process.env.REACT_CLIENT_RENDER !== 'false') {
  server.use('/dist', proxy(url.parse('http://localhost:3002/dist')));
} else if (process.env.NODE_ENV === 'production') {
  // Signify gzipped assets on production
  server.use('/dist/*.js', (req, res, next) => {
    res.set('Content-Encoding', 'gzip');
    next();
  });
}

server.use(favicon(path.join(__dirname, '/favicon.ico')));
server.use('/dist', express.static(path.join(__dirname, '/dist')));


// ----------------------------------------------------------------------------
// Fluxible + react-router server rendering
// ----------------------------------------------------------------------------

server.use((req, res, next) => {

  // Skip attempts to render if the server has aborted for any reason.
  if (req.abortNavigation) {
    return next();
  }

  let context = app.createContext();

  // Pass flag to router's transition context for first
  // render. willTransitionTo doesn't have access to hydrated
  // stores on first render. Flag is needed for auth verification.
  if (req.user) {
    let state = {
      user: req.user
    };

    context.user = req.user;
    context.executeAction(loginAction, state);
  }

  debug('Prerender data:', req.preRender);
  let router = Router.create({
    routes: app.getComponent(),
    location: req.path,

    // Fluxible's branch allows for passing of Fluxible context
    // within React Router. Exposed in a component's willTransitionTo(arg)
    // method as arg.context.
    // Working off a branch of react-router:
    // https://github.com/bobpace/react-router/tree/transitionContext
    transitionContext: context,

    // need an onAbort handler for when there's a react-router redirect or
    // route failure.
    onAbort: ({to, params, query}) => {
      debug(`React router errored on server render.
        "onAbort" triggers if there is a react-router "abort()" or
        a "transitionTo()" or a redirect().`, to, params, query
      );
      req.abortNavigation = {to, params, query};
      next();
      // res.redirect('/');
    }
  });

  router.run((Handler, state) => {

    // Inject server data and login data for store consumption
    state.preRender = req.preRender || {};
    state.login = req.user;

    // Include flash messaging in initial server response
    const flashMessage = req.flash('flashMessage');
    if (flashMessage.length) {
      debug('Flash message vvvvvvv');
      debug(flashMessage);
      state.preRender.flashMessage = flashMessage;
    }

    context.executeAction(navigateAction, state, (err) => {
      if (err) {
        debug('Navigate error:', err);
        req.abortNavigation = true;
        next();
      }

      debug('Exposing context state');
      // Passing window.App is the first part of the server/client relay
      const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';
      const component = React.createFactory(Handler);
      const componentContext = context.getComponentContext();

      // Only inject markup into the page when specified by REACT_SERVER_RENDER
      let markup = '';
      if (process.env.REACT_SERVER_RENDER !== 'false') {
        markup = React.renderToString(component({
          context: componentContext
        }));
      }
      let clientRender = process.env.REACT_CLIENT_RENDER !== 'false';

      debug('Rendering Application component into HTML');
      const html = React.renderToStaticMarkup(htmlComponent({
        title: 'Isomorphic Auth Flow',
        state: exposed,
        markup,
        clientRender
      }));

      debug('Sending markup');
      res.send(html);
    });
  });
});

server.use((req, res) => {

  if (req.abortNavigation) {
    const {to, params, query} = req.abortNavigation;
    debug('React aborting, attempting redirect.', to, params, query);
    req.flash('flashMessage', CONSTANTS[params.reason]);
    res.redirect(to);
  }
});

server.listen(PORT);
debug('Listening on port ' + PORT);
