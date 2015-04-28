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
    'REQUEST_START': 'requestStart',
    'REQUEST_END': 'requestEnd',
    'NAVIGATION_ERROR': 'navigationError',
    'FLASH_MESSAGE': 'flashMessagez',
    'SET_PAGE_USER_PREF': 'setPageUserPref',
    'SAVE_REQUEST_ATTEMPT': 'saveRequestAttempt'
  },

  navigationError(payload) {
    this.setRedirect({
      url: '/',
      flashMessage: payload
    });
  },

  initialize() {
    this.currentRoute = null;
    this.loggedIn = false;
    this.email = null;
    this.redirect = null;
    this.appIsLoading = null;
    this.flashMessage = null;
    this.reqAttempt = null;
    this.userLevel = null;
    this.pageUserPref = null;
  },

  setPageUserPref({route, preference}) {
    this.pageUserPref = {
      [route]: preference
    };
  },

  saveRequestAttempt(message) {
    this.reqAttempt = message;
  },

  flashMessagez(message) {
    debug('FLASHING');
    if (message instanceof Array) {
      message = message[0];
    }
    this.flashMessage = message;
    this.emitChange();
  },

  requestStart() {
    this.appIsLoading = true;
    this.flashMessage = null;
    this.emitChange();
  },

  requestEnd() {
    this.appIsLoading = false;
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
    }
  },

  setRedirect(payload) {

    // Preserve flash message if this is a redirect.

    this._redirectFlash = payload.flashMessage;
    this.redirect = payload.url;
    debug(payload);
    debug('SETTING REDURECT!!!', this.redirect);
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
      flashMessage: this.flashMessage,
      pageUserPref: this.pageUserPref,
      reqAttempt: this.reqAttempt
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
    this.pageUserPref = state.pageUserPref;
    this.reqAttempt = state.reqAttempt;
  }
});
