'use strict';
import React from 'react'
import {FluxibleMixin} from 'fluxible'
import ApplicationStore from '../stores/ApplicationStore'
import {CheckLoginMixin} from '../mixins/authMixins';
import debug from 'debug';
import DocumentTitle from 'react-document-title';
debug('Component:Dashboard');

export default React.createClass({

  displayName: 'Dashboard',

  mixins: [FluxibleMixin, CheckLoginMixin],

  statics: {
    storeListeners: [ApplicationStore]
  },

  componentDidMount() {
    let timer = 0;
    setInterval(() => {
      timer++;
      this.setState({
        title: `${timer} Timing!!!`
      });
    }, 250);
  },

  getInitialState() {
    let state = this.getStore(ApplicationStore).getState();
    state.title = 'Dashboard';
    return state;
  },

  onChange() {
    var state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },

  render() {
    return (
      <DocumentTitle title={this.state.title}>
        <div>
          <p>Here's your dashboard!</p>
          <p>I think your user name is: {this.state.email}</p>
        </div>
      </DocumentTitle>
    );
  }
})
