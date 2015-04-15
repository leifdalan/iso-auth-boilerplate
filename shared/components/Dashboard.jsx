'use strict';
import React from 'react'
import {FluxibleMixin} from 'fluxible'
import ApplicationStore from '../stores/ApplicationStore'
import {CheckLoginMixin} from '../mixins/authMixins';
import debug from 'debug'
debug('Component:Dashboard');

export default React.createClass({

  displayName: 'Dashboard',

  mixins: [FluxibleMixin, CheckLoginMixin],

  statics: {
    storeListeners: [ApplicationStore]
  },

  getInitialState() {
    return this.getStore(ApplicationStore).getState();
  },

  onChange() {
    var state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },

  render() {
    return (
        <div>
          <p>Here's your dashboard, dog.</p>
          <p>I think your email is: {this.state.email}</p>
        </div>
    );
  }
})
