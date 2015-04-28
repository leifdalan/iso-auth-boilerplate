'use strict';
import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../stores/ApplicationStore';
import {loginAction, signUpAction} from '../actions/authActions';
import {autoBindAll} from '../../utils';
const debug = require('debug')('Component:SignIn');
debug();

class Signin extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'login',
      'signUp',
      'usernameHandler',
      'passwordHandler',
      'numberHandler'
    ]);
    this.state = props;
  }

  static displayName = 'Signin'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  login(e) {
    e.preventDefault();
    const {usernameValue: email, passwordValue: password} = this.state;
    if (!this.state.flashWarning) {
      this.context.executeAction(loginAction, {
        email,
        password,
        reqAttempt: this.state.reqAttempt,
        router: this.context.router
      });
    }
  }

  usernameHandler(e) {
    const sanitized = e.target.value.replace(/[^a-z0-9]/gi, '');
    const flashWarning = (sanitized !== e.target.value);
    this.setState({
      usernameValue: sanitized,
      flashWarning
    });
  }

  passwordHandler(e) {
    const passwordValue = e.target.value;
    this.setState({
      passwordValue
    });
  }

  numberHandler(e) {
    const numberValue = e.target.value;
    this.setState({
      numberValue
    });
  }

  signUp(e) {
    e.preventDefault();
    const username = this.state.usernameValue;
    const password = this.state.passwordValue;
    const number = this.state.numberValue;
    !this.state.flashWarning &&
    this.context.executeAction(signUpAction, {
      email: username,
      router: this.context.router,
      password,
      userLevel: number
    });
  }

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
}

export default Signin;
