'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../stores/ApplicationStore'

export default React.createClass({
  displayName: 'NotFound',

  mixins: [FluxibleMixin],

  statics: {
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
        <h1>This page doesn't exist!</h1>
    );
  }
})
