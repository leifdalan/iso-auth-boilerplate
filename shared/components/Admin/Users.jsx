'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../../stores/ApplicationStore';
import UserStore from '../../stores/UserStore';
import navigateAction from '../../actions/navigate';
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

  handleClick(id, e) {
    debug(id);
    debug(e);
  },

  handleEditClick(id, e) {
    e.preventDefault();
    this.context.router.transitionTo(`/admin/users/${id}`);
  },

  render() {
    return (
      <div>
        <h1>Users</h1>
          {this.state.users.map(
            (user, index) =>
            <div
              key={user._id}
              index={index}
              onClick={this.handleClick.bind(this, user._id)}>
              <h2>{user.local.email}</h2>
              <p>User level: {user.userLevel}</p>
              <button
                className="button-primary"
                onClick={this.handleEditClick.bind(this, user._id)}>
                Edit
              </button>
            </div>
            )
          }
      </div>
    );
  }
})
