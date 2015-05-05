'use strict';

import {BaseStore} from 'fluxible/addons';
import {cloneDeep} from 'lodash';
const debug = require('debug')('Store:Pages');

export default class PageStore extends BaseStore {
  constructor(dispatcher) {
    super(dispatcher);
    this.pages = [];
    this.totalPages = null;
    this.singlePage = null;
    this.search = null;
    this.currentPageNumber = null;
    this.perpage = null;
    this.pageAdjustment = null;
    this._lastValidSinglePage = null;
  }

  static storeName = 'PageStore'

  static handlers = {
    'adminPagesPaginated_PAYLOAD': 'handlePayload',
    'adminPageEdit_PAYLOAD': 'handleEditPayload',
    'adminPageEdit_FAILURE': 'handleEditFailure',
    'CHANGE_ROUTE': 'handleNavigate'
  }

  handleNavigate({payload, resolution}) {
    debug(payload);
    debug(resolution);
    this.singlePage = resolution;
    this.emitChange();
  }

  handlePayload(payload) {
    // debug('RECEIVING PAYLOAD', payload);
    this.pages = payload.pages || [];
    this.totalPages = payload.totalPages;
    this.currentPageNumber = payload.currentPageNumber;
    this.perpage = payload.perpage;
    this.pageAdjustment = payload.pageAdjustment;
    this.search = payload.search;
    this.emitChange();
    this.pageAdjustment = null;
  }

  handleEditFailure(message) {
    debug('Handling Edit Failre', message);
    this.singlePage = cloneDeep(this._lastValidSinglePage);
    debug('Failure old page...', this.singlePage);
    this.emitChange();
  }

  handleEditPayload(payload) {
    this.singlePage = payload;
    this._lastValidSinglePage = cloneDeep(payload);
    debug(cloneDeep(payload));
    debug('Last Valid', this._lastValidSinglePage);
    this.emitChange();
  }

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
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.pages = state.pages;
    this.totalPages = state.totalPages;
    this.singlePage = state.singlePage;
    this.perpage = state.perpage;
    this.search = state.search;
    this.pageAdjustment = state.pageAdjustment;
    this.currentPageNumber = state.currentPageNumber;
  }
}
