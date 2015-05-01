'use strict';
import {BaseStore} from 'fluxible/addons';
import {cloneDeep} from 'lodash';
const debug = require('debug')('Store:Users');

export default class UserStore extends BaseStore {
  constructor(dispatcher) {
    super(dispatcher);
    this.users = [];
    this.totalUsers = null;
    this.singleUser = null;
    this.search = null;
    this.currentPageNumber = null;
    this.perpage = null;
    this.pageAdjustment = null;
    this._lastValidSingleUser = null;
  }

  static storeName = 'UserStore'

  static handlers = {
    'adminUsersPaginated_PAYLOAD': 'handlePayload',
    'adminUserEdit_PAYLOAD': 'handleEditPayload',
    'adminUserEdit_FAILURE': 'handleEditFailure'
  }

  handlePayload(payload) {
    // debug('RECEIVING PAYLOAD', payload);
    this.users = payload.users;
    this.totalUsers = payload.totalUsers;
    this.currentPageNumber = payload.currentPageNumber;
    this.perpage = payload.perpage;
    this.pageAdjustment = payload.pageAdjustment;
    this.search = payload.search;
    this.emitChange();
  }

  handleEditFailure(message) {
    debug('Handling Edit Failre', message);
    this.singleUser = cloneDeep(this._lastValidSingleUser);
    debug('Failure old user...', this.singleUser);
    this.emitChange();
  }

  handleEditPayload(payload) {
    this.singleUser = payload;
    this._lastValidSingleUser = cloneDeep(payload);
    debug(cloneDeep(payload));
    debug('Last Valid', this._lastValidSingleUser);
    this.emitChange();
  }

  getState() {
    return {
      users: this.users,
      singleUser: this.singleUser,
      perpage: this.perpage,
      currentPageNumber: this.currentPageNumber,
      search: this.search,
      pageAdjustment: this.pageAdjustment,
      totalUsers: this.totalUsers
    };
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.users = state.users;
    this.totalUsers = state.totalUsers;
    this.singleUser = state.singleUser;
    this.perpage = state.perpage;
    this.search = state.search;
    this.pageAdjustment = state.pageAdjustment;
    this.currentPageNumber = state.currentPageNumber;
  }
}
