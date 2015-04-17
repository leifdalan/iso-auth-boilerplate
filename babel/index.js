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
import routes from '../shared/routes';
import CST from '../shared/constants';

// React goodness
import React from 'react';
import Router from 'react-router';
import {loginAction, logoutAction} from '../shared/actions/authActions';
import navigateAction from '../shared/actions/navigate';
import app from '../shared/app';
import Html from '../shared/components/Html';
import DocumentTitle from 'react-document-title';

const htmlComponent = React.createFactory(Html);

// Passport imports
import passport from 'passport';
import passportConfig from '../config/passport';
import config from '../config';
const {
  PUBLIC_PATH: PUBLICPATH,
  WEBPACK_DEV_SERVER_PORT: DEVSERVERPORT,
  HOSTNAME,
  PROTOCOL
} = config;

const debug = nodeDebug('Server');

mongoose.connect(config.url);

passportConfig(passport);

const server = express();
const PORT = process.env.PORT || 3030;

debug('Environment Variables:');
debug('REACT_CLIENT_RENDER:', process.env.REACT_CLIENT_RENDER);
debug('REACT_SERVER_RENDER:', process.env.REACT_SERVER_RENDER);
debug(`${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`);
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
  server.use(`${PUBLICPATH}`,
    proxy(url.parse(`${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`))
  );
} else if (process.env.NODE_ENV === 'production') {

  // Signify gzipped assets on production
  server.use(`${PUBLICPATH}/*.js`, (req, res, next) => {
    res.set('Content-Encoding', 'gzip');
    next();
  });
}

server.use(favicon(path.join(__dirname, '../favicon.ico')));
server.use(`${PUBLICPATH}`,
  express.static(path.join(__dirname, `../${PUBLICPATH}`))
);

// ----------------------------------------------------------------------------
// Fluxible + react-router server rendering
// ----------------------------------------------------------------------------

server.use((req, res, next) => {

  // Skip attempts to render if the server has aborted for any reason.
  if (req.abortNavigation) {
    return next();
  }

  const appContext = app.createContext();

  // --------------------------------------------------------------------------
  // Pass flag to router's transition context for first
  // render. willTransitionTo doesn't have access to hydrated
  // stores on first render. Flag is needed for auth verification.
  // --------------------------------------------------------------------------

  if (req.user) {
    const state = {
      user: req.user
    };

    appContext.user = req.user;
    appContext.executeAction(loginAction, state);
  }

  debug('Prerender data:', req.preRender);
  const router = Router.create({
    routes: app.getComponent(),
    location: req.path,

    // ------------------------------------------------------------------------
    // bobpace's branch allows for passing of Fluxible context
    // within React Router. Exposed in a component's willTransitionTo(arg)
    // method as arg.context.
    // Working off a branch of react-router:
    // https://github.com/bobpace/react-router/tree/transitionContext
    // ------------------------------------------------------------------------
    transitionContext: appContext,

    // need an onAbort handler for when there's a react-router router failure.
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

  router.run((Handler, routerState) => {

    // Inject server data and login data for store consumption
    routerState.preRender = req.preRender || {};
    routerState.login = req.user;

    // Include flash messaging in initial server response
    const flashMessage = req.flash('flashMessage');
    if (flashMessage.length) {
      debug('Flash message vvvvvvv');
      debug(flashMessage);
      routerState.preRender.flashMessage = flashMessage;
    }

    // Atempt fluxible action through the navigation flow
    appContext.executeAction(navigateAction, routerState, (err) => {
      if (err) {
        debug('Navigate error:', err);
        req.abortNavigation = true;
        return next();
      }

      // Passing window.App is the first part of the server/client relay
      debug('Exposing appContext state');
      const state = 'window.App=' + serialize(app.dehydrate(appContext)) + ';';
      const component = React.createFactory(Handler);
      const context = appContext.getComponentContext();

      // Disable client rendering by not including script tag
      const shouldClientRender = process.env.REACT_CLIENT_RENDER !== 'false';

      // Only inject markup into the page when specified by REACT_SERVER_RENDER
      let markup = '', title;
      if (process.env.REACT_SERVER_RENDER !== 'false') {
        if (!shouldClientRender) {

          // Don't need data-react ids if there's no client code
          markup = React.renderToStaticMarkup(component({context}));
        } else {

          // Include data-react-ids for client bootstrapping to prevent
          // full client re-render on initialization.
          markup = React.renderToString(component({context}));
          title = DocumentTitle.rewind();
          debug('DOCUMENT TITLE === %s', title);
        }
      }

      // Render document HTML
      debug('Rendering Application component into HTML');
      const html = React.renderToStaticMarkup(htmlComponent({
        title,
        markup,
        state,
        shouldClientRender
      }));

      debug('Sending markup.');
      res.send(
        `<!DOCTYPE html>
        ${html}`
      );
    }); // End appContext.executeAction
  }); // End router.run
});// server.use

server.use((req, res) => {

  // ---------------------------------------------------------------------------
  // Last ditch effort to redirect if there's a react-router
  // failure or anything else that attaches abortNavigation to the
  // req object.
  // ---------------------------------------------------------------------------
  if (req.abortNavigation) {
    const {to, params, query} = req.abortNavigation;
    debug('React aborting, attempting redirect.', to, params, query);
    req.flash('flashMessage', CST[params.reason]);
    to && res.redirect(to);

    // TODO Make a sensible 500 page with React.renderToStaticMarkup.
    const markup = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Server error</h1>
      </body>
    </body>
    `;
    res.status(500).send(markup);
  }
});

server.listen(PORT);
debug('Listening on port ' + PORT);
