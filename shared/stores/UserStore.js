'use strict';
import {createStore} from 'fluxible/addons';
const debug = require('debug')('Store:Users');

export default createStore({
  storeName: 'UserStore',

  handlers: {
    '_ADMIN_USERS__PAYLOAD': 'handlePayload'
  },

  initialize() {
    this.users = [];
  },

  handlePayload(payload) {
    debug('RECEIVING PAYLOAD', payload);
    this.users = payload;
    this.emitChange();
  },

  getState() {
    return {
      users: this.users
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.users = state.users;
  }
});
