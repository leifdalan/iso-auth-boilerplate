'use strict';
import {createStore} from 'fluxible/addons';
const debug = require('debug')('Store:ApplicationStore');

export default createStore({
  storeName: 'ApplicationStore',
  handlers: {
    'CHANGE_ROUTE': 'handleNavigate',
    'LOGIN': 'login',
    'LOGOUT': 'logout',
    'REDIRECT': 'setRedirect',
    'CLEAR_REDIRECT': 'clearRedirect',
    'NAVIGATION_START': 'navigationStart',
    'NAVIGATION_ERROR': 'navigationError',
    'FLASH_MESSAGE': 'flashMessagez',
    // 'SAVE_UNAUTHENTICATED_NAVIGATION_TRANSITION': 'saveTransition'
  },

  navigationError() {
    this.setRedirect({
      url: '/'
    });
  },

  // saveTransition(transition) {
  //
  // },

  initialize() {
    this.currentRoute = null;
    this.loggedIn = false;
    this.email = null;
    this.redirect = null;
    this.appIsLoading = null;
    this.flashMessage = null;
    this.userLevel = null;
  },

  flashMessagez(message) {
    if (message instanceof Array) {
      message = message[0];
    }
    this.flashMessage = message;
    this.emitChange();
  },

  navigationStart() {
    this.appIsLoading = true;
    this.flashMessage = null;
    this.emitChange();
  },

  handleNavigate(route) {
    this.appIsLoading = false;
    debug('HANDLING NAVIGATE vvvvvvv');
    debug(route);
    if (this.currentRoute && route.path === this.currentRoute.path) {
      debug('Attempted to navigate to the same path.');
      return;
    }

    // Preserve flash message if this is a redirect.
    if (this._redirectFlash) {
      this.flashMessage = this._redirectFlash;
    }
    this.currentRoute = route;
    this.emitChange();

    // Preserve flash message if this is a redirect.
    if (this._redirectFlash) {
      this._redirectFlash = null;
      this.flashMessage = null;
    }
  },

  setRedirect(payload) {

    // Preserve flash message if this is a redirect.
    this._redirectFlash = payload.flashMessage;
    this.redirect = payload.url;
    this.emitChange();
  },

  clearRedirect() {
    this.redirect = null;
    this.emitChange();
  },

  login({userLevel=1, local}) {
    debug('logging in');
    this.loggedIn = true;
    this.email = local.email;
    this.userLevel = userLevel;
    this.emitChange();
  },

  logout() {
    this.loggedIn = false;
    this.email = null;
    this.userLevel = null;
    this.emitChange();
  },

  getState() {
    return {
      route: this.currentRoute,
      loggedIn: this.loggedIn,
      email: this.email,
      userLevel: this.userLevel,
      redirect: this.redirect,
      appIsLoading: this.appIsLoading,
      flashMessage: this.flashMessage
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.currentRoute = state.route;
    this.loggedIn = state.loggedIn;
    this.email = state.email;
    this.userLevel = state.userLevel;
    this.redirect = state.redirect;
    this.appIsLoading = state.appIsLoading;
    this.flashMessage = state.flashMessage;
  }
});
