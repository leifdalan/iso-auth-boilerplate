import path from 'path';
import express from 'express';
import session from 'express-session';
import favicon from 'serve-favicon'
import compress from 'compression';
import proxy from 'proxy-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import morgan from 'morgan';
import mongoose from 'mongoose';
import url from 'url';
import services from '../services';
import CST from '../shared/constants';
import reactRender from './reactrender';

// Passport imports
import passport from 'passport';
import passportConfig from '../config/passport';
import config from '../config';

const {
  PUBLIC_PATH: PUBLICPATH,
  WEBPACK_DEV_SERVER_PORT: DEVSERVERPORT,
  BROWSERSYNC_PORT: BSPORT,
  MONGOLAB_URI,
  HOSTNAME,
  PROTOCOL,
  DEVELOPMENT_PORT
} = config;

const debug = require('debug')('Server');

mongoose.connect(MONGOLAB_URI);

passportConfig(passport);

const server = express();
const PORT = process.env.PORT || DEVELOPMENT_PORT;

debug('Environment Variables:');
debug('REACT_CLIENT_RENDER: %s', process.env.REACT_CLIENT_RENDER);
debug('REACT_SERVER_RENDER: %s', process.env.REACT_SERVER_RENDER);
debug('NODE_ENV: %s', process.env.NODE_ENV);
debug('ALWAYS_ADMIN: %s', process.env.ALWAYS_ADMIN);
debug(`Webpack Dev Server: ${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`);
debug(`BrowserSync Dev Server: ${PROTOCOL}${HOSTNAME}:${BSPORT}`);

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

// Login into administrator automatically for certain development modes
if (process.env.ALWAYS_ADMIN) {
  let initialLogin = false;
  server.use((req, res, next) => {
    if (initialLogin) return next();
    req.body = {email: 'admin', password: 'admin'};
    passport.authenticate('local-login', (err, user) => {
      req.logIn(user, function(loginErr) {
        if (loginErr) {
          return next(loginErr);
        }
        initialLogin = true;
        next();
      });
    })(req, res, next);
  })
}

// Load our services and pass in our app and fully configured passport
// This is where all the routing for mongoDB service calls live.
services(server);

// Proxy public folder to WebPack's hot loading server during development
// If not development, we're using an S3 bucket for static assets.
if (process.env.NODE_ENV === 'development' &&
  process.env.REACT_CLIENT_RENDER !== 'false') {
  server.use(`${PUBLICPATH}`,
    proxy(url.parse(`${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`))
  );
  server.use(`${PUBLICPATH}`,
    express.static(path.join(__dirname, `../${PUBLICPATH}`))
  );
}

server.use(favicon(path.join(__dirname, '../favicon.ico')));

// Fluxible + react-router markup generator, attemps to send response.
server.use(reactRender);

server.use((req, res) => {

  // ---------------------------------------------------------------------------
  // Last ditch effort to redirect if there's a react-router
  // failure or anything else that attaches abortNavigation to the
  // req object.
  // ---------------------------------------------------------------------------

  // TODO Make a sensible 500 page with React.renderToStaticMarkup.
  const markup500 = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Server error</h1>
    </body>
  </body>
  `;

  if (req.abortNavigation) {
    const {to, params, query, reactRenderError} = req.abortNavigation;
    debug('React aborting, attempting redirect.', to, params, query);
    if (params && params.reason) {
      req.flash('flashMessage', CST[params.reason]);
    }

    debug('Attempted URL:', req.url);
    req.flash('reqAttempt', req.url);

    if (reactRenderError) {
      res.status(500).send(markup500);
    } else if (to) {
      res.redirect(to);
    }

  } else {

    // Everything is broken.
    res.status(500).send(markup500);
  }
});

server.listen(PORT);
debug('Listening on port ' + PORT);
