'use strict';
import React from 'react';
import PageStore from '../stores/PageStore';
import {FluxibleMixin} from 'fluxible';
import nodeDebug from 'debug'

const debug = nodeDebug('Component:Page');

export default React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [PageStore]
  },
  getInitialState() {
    debug('initialState:');
    debug( this.getStore(PageStore).getState());
    return this.getStore(PageStore).getState();
  },
  onChange() {
    let state = this.getStore(PageStore).getState();
    debug('change.');
    debug(state);
    this.setState(state);
  },
  render() {
    return (
      <p {...this.props.state}>{this.state.content}</p>
    );
  }
});
