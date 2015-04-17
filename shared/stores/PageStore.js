'use strict';
import {createStore} from 'fluxible/addons';
const debug = require('debug')('Store:Page');

export default createStore({
  storeName: 'PageStore',

  handlers: {
    'LOAD_PAGE': 'handleContentChange'
  },

  initialize() {
    this.content = 'initial content...';
  },

  handleContentChange(payload) {
    debug('page handle change');
    this.content = 'content for page with id ' + payload.params.id;
    this.emitChange();
  },

  getState() {
    return {
      content: this.content
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.content = state.content;
  }
});
