'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../stores/ApplicationStore'
import debug from 'debug';
debug('Component:Admin');

export default React.createClass({
  displayName: 'AdminPage',

  mixins: [FluxibleMixin],

  statics: {

    willTransitionTo(transition) {
      const {loggedIn, userLevel} =
        transition
          .context
          .getActionContext()
          .getStore(ApplicationStore)
          .getState();

      const isLoggedIn = transition.context.user || loggedIn;

      if (!isLoggedIn) {
        debug('Redirecting from about to "/"...');
        transition.redirect('/signin', {reason: 'UNAUTHENTICATED'});
      } else {
        const isAuthorized = transition.context.user.userLevel > 1 ||
          userLevel > 1;
        if (!isAuthorized) {
          debug('Redirecting from about to "/"...');
          transition.redirect('/', {
            reason: 'UNAUTHORIZED'
          });
        }
      }
    },

    storeListeners: [ApplicationStore]
  },

  getInitialState() {
    return this.getStore(ApplicationStore).getState();
  },

  onChange() {
    const state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },

  render() {
    return (
        <div>Only LEVEL 2 or ABOVE can see this!!! MUHAHAHA</div>
    );
  }
})
