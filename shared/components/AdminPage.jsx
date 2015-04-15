'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../stores/ApplicationStore'
import debug from 'debug';
import {CheckAdminMixin} from '../mixins/authMixins';
debug('Component:Admin');

export default React.createClass({
  displayName: 'AdminPage',

  mixins: [FluxibleMixin, CheckAdminMixin],

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
        <div>Only LEVEL 2 or ABOVE can see this!!! MUHAHAHA</div>
    );
  }
})
