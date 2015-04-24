'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserStore from '../../stores/UserStore';
import navigateAction from '../../actions/navigate';
import Paginator from './Paginator';
import {CheckAdminMixin} from '../../mixins/authMixins';
import {searchUserAction} from '../../actions/userActions';
import {isClient} from '../../../utils';
const debug = require('debug')('Component:Users');


export default React.createClass({
  displayName: 'Users',

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin, CheckAdminMixin],

  statics: {
    storeListeners: [UserStore]
  },

  getInitialState() {
    let state = this.getStore(UserStore).getState();
    let users = state.users.map((user) => {
      user.selected = false;
      return user;
    });
    state.users = users;
    state.pageAdjustment && this._adjustPageBounds(state);
    return state;
  },

  _adjustPageBounds(state) {
    if (isClient()) {
      const pathArray = window.location.pathname.split('/');
      const queryString = window.location.search;
      pathArray[5] = state.currentPageNumber;
      window.history.replaceState({}, {}, `${pathArray.join('/')}${queryString}`);
    }
  },

  onChange() {
    let state = this.getStore(UserStore).getState();
    state.pageAdjustment && this._adjustPageBounds(state);
    this.setState(state);
  },

  handleClick(id, e) {
    debug(id);
    debug(e);
  },

  handleEditClick(id, e) {
    e.preventDefault();
    this.context.router.transitionTo(`/admin/users/${id}`);
  },

  handleNumberInput(e) {
    this.setState({
      perPageInput: e.target.value > 200 ? 200 : e.target.value
    });
  },

  handleButton(e) {
    e.preventDefault();
    const perpage = this.state.perPageInput || this.state.perpage;
    if (this.state.searchValue && isClient()) {
      window.history.pushState({}, {}, `?s=${this.state.search}`);
    }
    this.context.router.transitionTo(
      `/admin/users/page/${perpage}/1`
    );
  },

  goToCreateUser(e) {
    e.preventDefault();
    this.context.router.transitionTo('createUser');
  },

  handleCheckAll() {
    const value = this.refs.globalSelector.getDOMNode().checked;
    const users = this.state.users.map((user) => {
      user.selected = value;
      return user;
    });
    this.setState({users});
  },

  handleSearchInput(e) {
    this.setState({
      search: e.target.value
    });

    if (e.target.value.length === 0 && isClient()) {
      // Remove query string if the search bar is empty. It's ugly.
      window.history.replaceState({}, {}, window.location.href.split('?')[0]);
    } else {
      window.history.replaceState({}, {}, `?s=${e.target.value}`);
    }

    this.executeAction(searchUserAction, e.target.value);

  },

  handleCheck(_id) {
    const users = this.state.users.map((user) => {
      user.selected = user._id === _id ? !user.selected : user.selected;
      return user;
    });
    this.setState({users});
  },

  render() {
    const paginator = (
      <Paginator
        currentPageNumber={this.state.currentPageNumber}
        totalItems={this.state.totalUsers}
        perpage={this.state.perpage}
        neighborDepth={1}
        pathBase="/admin/users/page/"
      />
    );

    const noUsers = (
      <h2>No users match{` "${this.state.search}"`}!</h2>
    );

    const userForm = (
      <div>
        <input
          type="number"
          onChange={this.handleNumberInput}
          value={this.state.perPageInput}
          placeholder={`Items per page (${this.state.perpage})`}
        />
        <button
          onClick={this.handleButton}>
          Update Items/page
        </button>

        {paginator}

        {this.state.search &&
          <small>
            {`"${this.state.search}" matches ${this.state.totalUsers} users`}
          </small>
        }

        <table className="user-table">
          <thead>
            <tr>
              <td>
                <input
                  ref="globalSelector"
                  onChange={this.handleCheckAll}
                  type="checkbox" />
              </td>
              <td>Username</td>
              <td>User Level</td>
              <td>
                <button onClick={() => window.alert('Coming soon :)')}>
                  Bulk Edit
                </button>
              </td>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map(
              (user, index) =>
              <tr
                key={user._id}
                index={index}>

                <td>
                  <input
                    onChange={this.handleCheck.bind(this, user._id)}
                    type="checkbox"
                    ref={user._id}
                    checked={user.selected}
                    />
                </td>
                <td>{user.local.email}</td>
                <td>{user.userLevel}</td>
                <td>
                  <button
                    onClick={this.handleEditClick.bind(this, user._id)}>
                    Edit
                  </button>
                </td>
              </tr>
              )
            }
          </tbody>
        </table>

        {paginator}
      </div>
    );

    const body = this.state.users.length ? userForm : noUsers;

    return (
      <div>
        <h1>Users</h1>
        <div>
          <button
            className="button-primary"
            onClick={this.goToCreateUser}>
            Create user
          </button>
            <input
              className="user-search"
              type="search"
              onChange={this.handleSearchInput}
              value={this.state.search}
              placeholder={`Search for users`}
            />
        </div>
        {body}
      </div>
    );
  }
})
