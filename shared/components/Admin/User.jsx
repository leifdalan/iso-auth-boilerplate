'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserStore from '../../stores/UserStore';
import UserForm from './UserForm';
import {CheckAdminMixin} from '../../mixins/authMixins';
import {editUserAction, deleteUserAction} from '../../actions/userActions';
// const debug = require('debug')('Component:User');


export default React.createClass({
  displayName: 'User',

  mixins: [FluxibleMixin, CheckAdminMixin],

  statics: {
    storeListeners: [UserStore]
  },

  getInitialState() {
    let state = this.getStore(UserStore).getState().singleUser;
    state.originalPassword = state.local.password;
    return state;
  },

  onChange() {
    let state = this.getStore(UserStore).getState().singleUser;
    state.originalPassword = state.local.password;
    this.setState(state);
  },

  handleDelete(e) {
    e.preventDefault();
    // TODO create an "Are you sure"
    this.executeAction(deleteUserAction, this.state);
  },

  handleSubmit(formState) {
    this.executeAction(editUserAction, formState);
  },

  render() {
    return (
      <div>
        <UserForm {...this.state} handleSubmit={this.handleSubmit} />

        <button onClick={this.handleDelete}>Delete User</button>
      </div>
    );
  }
})
