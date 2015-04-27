import React from 'react';
import Router from 'react-router';
import {loginAction, logoutAction} from '../shared/actions/authActions';
import navigateAction from '../shared/actions/navigate';
import app from '../shared/app';
import Html from '../shared/components/Html';
import DocumentTitle from 'react-document-title';
import serialize from 'serialize-javascript';
import uglify from 'uglify-js';
const debug = require('debug')('Server:ReactRouter');

const htmlComponent = React.createFactory(Html);

// ----------------------------------------------------------------------------
// Fluxible + react-router server rendering
// ----------------------------------------------------------------------------

export default function(req, res, next) {

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

  try {
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

      // Include "request attempt" for users who tried to navigate to an
      // unauthorized route, which they may be able to return to after login.
      const reqAttempt = req.flash('reqAttempt');
      if (reqAttempt.length) {
        routerState.preRender.reqAttempt = reqAttempt[0];
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
        let state = 'window.App=' + serialize(app.dehydrate(appContext)) + ';';

        // TODO: Uglifying takes ~150ms. There's comments and other crap in this
        // dehydrated state if we don't, though!
        // Maybe we need to look under the hood of Fluxible's
        // dehydrate.

        // // Let's uglify the state, it has comments, etc in it
        // state = uglify.minify(state, {fromString: true});


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
          state,
          title,
          markup,

          shouldClientRender
        }));

        debug('Sending markup.');
        res.send(
          `<!DOCTYPE html>
          ${html}`
        );
      }); // End appContext.executeAction
    }); // End router.run
  } catch(err) {
    debug(err);
    req.abortNavigation = {
      error: err,
      reactRenderError: true
    }
    next();
  }
};// server.use
