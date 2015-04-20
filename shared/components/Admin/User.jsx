'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserStore from '../../stores/UserStore';
import {editUserAction} from '../../actions/userActions';
const debug = require('debug')('Component:User');


export default React.createClass({
  displayName: 'User',

  mixins: [FluxibleMixin],

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

  handleSubmit(e) {
    e.preventDefault();
    debug(this.state.local.password, this.state.originalPassword);
    if (this.state.local.password === this.state.originalPassword) {
      debug('Setting...');
      this.setState({
        local: {
          email: this.state.local.email
        }
      });
    }
    this.setState({
      lastUpdated: new Date()
    });
    debug('state', this.state);
    this.executeAction(editUserAction, this.state);
  },

  handleChange(field, e) {
    if (field === 'email' || field === 'password') {
      this.setState({
        local: {
          email: this.state.local.email,
          password: this.state.local.password,
          [field]: e.target.value
        }
      });
    } else {
      this.setState({
        [field]: e.target.value
      });
    }
  },

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label for="userLevel">userLevel</label>
          <input
            type="text"
            id="userLevel"
            name="userLevel"
            key="userLevel"
            onChange={this.handleChange.bind(null, 'userLevel')}
            value={this.state.userLevel}
            />
          <label for="isValidated">isValidated</label>
          <input
            type="text"
            id="isValidated"
            name="isValidated"
            key="isValidated"
            onChange={this.handleChange.bind(null, 'isValidated')}
            value={this.state.isValidated}
            />
          <label for="loginToken">loginToken</label>
          <input
            type="text"
            id="loginToken"
            name="loginToken"
            key="loginToken"
            onChange={this.handleChange.bind(null, 'loginToken')}
            value={this.state.loginToken}
            />
          <label for="email">email</label>
          <input
            type="text"
            id="email"
            name="email"
            key="email"
            onChange={this.handleChange.bind(null, 'email')}
            value={this.state.local.email}
            />
          <label for="password">password (encrypted)</label>
          <input
            type="text"
            id="password"
            name="password"
            key="password"
            onChange={this.handleChange.bind(null, 'password')}
            value={this.state.local.password}
            />
          <button
            className="button-primary"
            type="submit">
            Submit
          </button>
        </form>
      </div>
    );
  }
})
