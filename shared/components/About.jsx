'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../stores/ApplicationStore';
// var debug = require('debug')('Component:About');

export default React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    // willTransitionTo(transition) {
    //   let loggedIn = transition
    //       .context
    //       .getActionContext()
    //       .getStore(ApplicationStore)
    //       .getState()
    //       .loggedIn;
    //
    //   if (!loggedIn) {
    //     debug('Redirecting from about to "/"...');
    //     transition.redirect('/');
    //   }
    //
    // },
    storeListeners: [ApplicationStore]
  },

  getInitialState () {
    return {
      isLoggedIn: true
    };
  },

  onChange() {
    var state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },

  render() {
    return (
      <p>This is a description of the site.</p>
    );
  }
});
