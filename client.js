'use strict';

import React from 'react';
import debug from 'debug';
import app from './shared/app';
import Router, {HistoryLocation} from 'react-router';
import navigateAction from './shared/actions/navigate';
import config from './config';
import FluxibleComponent from 'fluxible/addons/FluxibleComponent';

const bootstrapDebug = debug('Bootstrapping App:');

// // react a11y warnings!
// require('react-a11y')();

// Second part of the server/client relay handoff
const dehydratedState = window.App;

// Set client dev tool debug level
window.localStorage &&
  window.localStorage.setItem('debug', config.clientDebug);

app.rehydrate(dehydratedState, (err, context) => {
  if (err) {
    throw err;
  }

  const renderApp = (runContext, Handler) => {
    bootstrapDebug('React Rendering');
    const mountNode = window.document.getElementById('app');

    // wrap the root element to provide children with access to the context
    const component = React.createFactory(Handler);
    React.render(React.createElement(
      FluxibleComponent,
      {context: runContext.getComponentContext()},
      component()
    ), mountNode);
  };

  const router = Router.create({
    routes: app.getComponent(),
    location: HistoryLocation,

    // Fluxible's branch allows for passing of Fluxible context
    // within React Router. Exposed in a component's willTransitionTo(arg)
    // method as arg.context.
    // Working off a branch of react-router:
    // https://github.com/bobpace/react-router/tree/transitionContext
    transitionContext: context
  });

  let firstRender = true;

  router.run((Handler, state) => {
    if (firstRender) {

      // Don't call the action on the first render on top of the server
      // rehydration. Otherwise there is a race condition where the action
      // gets executed before render has been called, which can cause the
      // checksum to fail.
      renderApp(context, Handler);
      firstRender = false;
    } else {
      context.executeAction(navigateAction, state, () => {
        renderApp(context, Handler);
      });
    }
  });
});
