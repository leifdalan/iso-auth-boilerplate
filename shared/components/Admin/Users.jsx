'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../../stores/ApplicationStore';
import UserStore from '../../stores/UserStore';
const debug = require('debug')('Component:Users');


export default React.createClass({
  displayName: 'Users',

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore, UserStore]
  },

  getInitialState() {
    const state = this.getStore(UserStore).getState();
    debug(state);
    return state;
  },

  onChange() {
    const state = this.getStore(UserStore).getState();
    this.setState(state);
  },

  render() {
    return (
        <div>
          <h1>Users</h1>
            {this.state.users.map(
              (user, index) =>
              <div key={index} index={index}>
                <h2>{user.local.email}</h2>
                <p>User level: {user.userLevel}</p>
              </div>
              )
            }
        </div>
    );
  }
})
