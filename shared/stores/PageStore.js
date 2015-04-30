'use strict';
import {createStore} from 'fluxible/addons';
import _ from 'lodash';
const debug = require('debug')('Store:Pages');

export default createStore({
  storeName: 'PageStore',

  handlers: {
    'adminPagesPaginated_PAYLOAD': 'handlePayload',
    'adminPageEdit_PAYLOAD': 'handleEditPayload',
    'adminPageEdit_FAILURE': 'handleEditFailure',
    'CHANGE_ROUTE': 'handleNavigate',
  },

  handleNavigate({payload, resolution}) {
    debug(payload);
    debug('==========================');
    debug(resolution);
    this.singlePage = resolution;
    this.emitChange();
  },

  initialize() {
    this.pages = [];
    this.totalPages = null;
    this.singlePage = null;
    this.search = null;
    this.currentPageNumber = null;
    this.perpage = null;
    this.pageAdjustment = null;
    this._lastValidSinglePage = null;
  },

  handlePayload(payload) {
    // debug('RECEIVING PAYLOAD', payload);
    this.pages = payload.pages;
    this.totalPages = payload.totalPages;
    this.currentPageNumber = payload.currentPageNumber;
    this.perpage = payload.perpage;
    this.pageAdjustment = payload.pageAdjustment;
    this.search = payload.search;
    this.emitChange();
  },

  handleEditFailure(message) {
    debug('Handling Edit Failre', message);
    this.singlePage = _.cloneDeep(this._lastValidSinglePage);
    debug('Failure old page...', this.singlePage);
    this.emitChange();
  },

  handleEditPayload(payload) {
    this.singlePage = payload;
    this._lastValidSinglePage = _.cloneDeep(payload);
    debug(_.cloneDeep(payload));
    debug('Last Valid', this._lastValidSinglePage);
    this.emitChange();
  },

  getState() {
    return {
      pages: this.pages,
      singlePage: this.singlePage,
      perpage: this.perpage,
      currentPageNumber: this.currentPageNumber,
      search: this.search,
      pageAdjustment: this.pageAdjustment,
      totalPages: this.totalPages
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.pages = state.pages;
    this.totalPages = state.totalPages;
    this.singlePage = state.singlePage;
    this.perpage = state.perpage;
    this.search = state.search;
    this.pageAdjustment = state.pageAdjustment;
    this.currentPageNumber = state.currentPageNumber;
  }
});
