'use strict';
import {createStore} from 'fluxible/addons';
const debug = require('debug')('Store:ApplicationStore');

export default createStore({
  storeName: 'ApplicationStore',
  handlers: {
    'CHANGE_ROUTE': 'handleNavigate',
    'LOGIN': 'login',
    'LOGOUT': 'logout',
    'REDIRECT': 'booya',
    'CLEAR_REDIRECT': 'clearRedirect',
    'NAVIGATION_START': 'navigationStart',
    'NAVIGATION_ERROR': 'navigationError',
    'FLASH_MESSAGE': 'flashMessagez'
  },

  navigationError() {
    this.booya({
      url: '/'
    });
  },

  initialize() {
    this.currentRoute = null;
    this.loggedIn = false;
    this.email = null;
    this.redirect = null;
    this.appIsLoading = null;
    this.flashMessage = null;
    this.userLevel = null;
  },

  flashMessagez(payload) {
    this.flashMessage = payload;
    this.emitChange();
    this.flashMessage = null;
  },

  navigationStart() {
    this.appIsLoading = true;
    this.emitChange();
  },

  handleNavigate(route) {
    this.appIsLoading = false;
    debug('HANDLING NAVIGATE', route);
    if (this.currentRoute && route.path === this.currentRoute.path) {
      debug('same path?!?!');
      return;
    }

    this.currentRoute = route;
    this.emitChange();
  },

  booya(payload) {
    this.redirect = payload.url;
    this.emitChange();
  },

  clearRedirect() {
    this.redirect = null;
    this.emitChange();
  },

  login({userLevel, local}) {
    debug('logging in');
    this.loggedIn = true;
    this.email = local.email;
    this.userLevel = userLevel || 1;
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
