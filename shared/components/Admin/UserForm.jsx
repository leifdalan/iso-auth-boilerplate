'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
const debug = require('debug')('Component:UserForm');


export default React.createClass({
  displayName: 'UserForm',

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return this.props;
  },

  mixins: [FluxibleMixin],

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      lastUpdated: new Date()
    });
    debug('state', this.state);
    this.executeAction(this.props.action, this.state);
  },

  handleChange(field, e) {
    if (field === 'email' || field === 'password') {
      if (!this.state.local) {
        this.setState({
          local: {}
        });
      }
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
          <label htmlFor="userLevel">userLevel</label>
          <input
            type="text"
            id="userLevel"
            name="userLevel"
            key="userLevel"
            onChange={this.handleChange.bind(null, 'userLevel')}
            value={this.state.userLevel}
            />
          <label htmlFor="isValidated">isValidated</label>
          <input
            type="text"
            id="isValidated"
            name="isValidated"
            key="isValidated"
            onChange={this.handleChange.bind(null, 'isValidated')}
            value={this.state.isValidated}
            />
          <label htmlFor="loginToken">loginToken</label>
          <input
            type="text"
            id="loginToken"
            name="loginToken"
            key="loginToken"
            onChange={this.handleChange.bind(null, 'loginToken')}
            value={this.state.loginToken}
            />
          <label htmlFor="email">email</label>
          <input
            type="text"
            id="email"
            name="email"
            key="email"
            onChange={this.handleChange.bind(null, 'email')}
            value={this.state.local && this.state.local.email}
            />
          <label htmlFor="password">Change Password</label>
          <input
            type="text"
            id="password"
            name="password"
            key="password"
            onChange={this.handleChange.bind(null, 'password')}
            value={this.state.local && this.state.local.password}
            />
          <div>
          <button
            className="button-primary"
            type="submit">
            {this.state.buttonText || 'Update User'}
          </button>
          </div>
        </form>
      </div>
    );
  }
})
