'use strict';

'use strict';
import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../stores/ApplicationStore';

import {autoBindAll, warn, error} from '../../utils';

import Nav from './Nav';
import AdminNav from './Admin/AdminNav';

import UserStore from '../stores/UserStore';
import {RouteHandler, Navigation} from 'react-router';
import {loginAction, logoutAction} from '../actions/authActions';
import clearRedirect from '../actions/clearRedirect';
import DocumentTitle from 'react-document-title';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';


const debug = require('debug')('Component:Application');

class Application extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'logout',
      'clearFlash',
      'log'
    ]);
    this.state = props.appStore;
  }

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const state = nextProps.appStore;
    if (this.state.flashMessage) {
      this._flashTimeout = setTimeout(() => {
        warn('Clearing flash message.');
        this.clearFlash();
      }, 5000);
    }
    this.setState(state);
  }

  logout(e) {
    e.preventDefault();
    const {router} = this.context;
    this.context.executeAction(logoutAction, {router});
  }

  clearFlash(e) {
    e && e.preventDefault();
    this.setState({
      flashMessage: ''
    });
  }

  log() {
    const state = this.context.getStore(ApplicationStore).getState();
    const userState = this.context.getStore(UserStore).getState();
    debug(userState);
    debug(state);
  }

  componentWillUnmount() {
    window.clearTimeout(this._flashTimeout);
  }

  render() {
    const name = this.context.router.getCurrentPath();

    const loggedInForm = (
      <form key={`form${name}`} action="/logout" method="POST">
        <button type="submit" onClick={this.logout}>Log out</button>
      </form>
    );

    const Navigation =
      this.state.userLevel > 1 && name.split('/')[1] === 'admin' ?
        <AdminNav {...this.state} /> :
        <Nav {...this.state} />;

    return (
      <DocumentTitle title="Isomorphic Auth Flow">
        <div className="app">
          <TransitionGroup component="div" transitionName="go-away">
            {this.state.flashMessage &&
              <button
                key="flashMessage"
                ref="flashMessage"
                onClick={this.clearFlash}
                className="u-full-width button button-primary flash">
                {this.state.flashMessage}
              </button>
            }
          </TransitionGroup>

          <TransitionGroup component="div" transitionName="loading">
            {this.state.appIsLoading &&
              <div
                className="loading-bar"
                key="loading-bar">
              </div>
            }
          </TransitionGroup>
          <div className="container">

            {Navigation}

            <TransitionGroup component="div" transitionName="example">
              <section key={name} className="main-content" role="main">
                <RouteHandler key={name} {...this.state} />
                <button
                  key={`button${name}`}
                  onClick={this.log}>
                  Log current application state
                </button>
                {this.state.loggedIn && loggedInForm}
              </section>
            </TransitionGroup>

          </div>
        </div>
      </DocumentTitle>
    );
  }
}

Application = connectToStores(Application, [ApplicationStore], (stores) => {
    return {
      appStore: stores.ApplicationStore.getState()
    }
});

export default Application;
