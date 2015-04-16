'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../stores/ApplicationStore'
import {loginAction, signUpAction} from '../actions/authActions';
const debug = require('debug')('Component:SignIn');

export default React.createClass({
  displayName: 'SignIn',

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore]
  },

  getInitialState() {
    let appState = this.getStore(ApplicationStore).getState();
    appState.usernameValue = '';
    return appState;
  },

  login(e) {
    e.preventDefault();
    debug('Logging in.');
    const {usernameValue: email, passwordValue: password} = this.state;
    if (!this.state.flashWarning) {
      this.executeAction(loginAction, {email, password});
    }
  },

  usernameHandler(e) {
    const usernameValue = e.target.value;
    const sanitized = e.target.value.replace(/[^a-z0-9]/gi, '');
    const flashWarning = (sanitized !== e.target.value);
    this.setState({
      usernameValue,
      flashWarning
    });
  },

  passwordHandler(e) {
    const passwordValue = e.target.value;
    debug(passwordValue);
    this.setState({
      passwordValue
    });
  },

  numberHandler(e) {
    const numberValue = e.target.value;
    debug(numberValue);
    this.setState({
      numberValue
    });
  },

  signUp(e) {
    e.preventDefault();
    const username = this.state.usernameValue;
    const password = this.state.passwordValue;
    const number = this.state.numberValue;
    debug('Signing up...');
    !this.state.flashWarning &&
    this.executeAction(signUpAction, {
      email: username,
      password,
      userLevel: number
    });
  },

  onChange() {
    const state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },

  render() {
    return (
        <form className="signin-form"
          onSubmit={this.login}
          method="POST"
          action="/login">
          <div className="row">
          <input
            type="text"
            name="email"
            ref="username"
            placeholder="Username"
            value={this.state.usernameValue}
            onChange={this.usernameHandler}
          />
          </div>
          <div className="row">
          <input
            type="password"
            name="password"
            ref="password"
            placeholder="Password"
            value={this.state.passwordValue}
            onChange={this.passwordHandler}
          />
          </div>
          <div className="row">
          <input
            type="number"
            ref="number"
            placeholder="Admin Level"
            value={this.state.numberValue}
            onChange={this.numberHandler}
          />
          </div>
          <button
            className="button-primary"
            type="submit"
            onClick={this.login}>
            Log in
          </button>
          <small> - OR - </small>
          <button onClick={this.signUp}>Sign Up!</button>
          {this.state.flashWarning &&
            <p>HEY! only letters and numbers, please.</p>
          }
        </form>
    );
  }
})
