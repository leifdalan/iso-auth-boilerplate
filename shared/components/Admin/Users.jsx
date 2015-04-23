'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../../stores/ApplicationStore';
import UserStore from '../../stores/UserStore';
import navigateAction from '../../actions/navigate';
import Paginator from './Paginator';
import {CheckAdminMixin} from '../../mixins/authMixins';
const debug = require('debug')('Component:Users');


export default React.createClass({
  displayName: 'Users',

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin, CheckAdminMixin],

  statics: {
    storeListeners: [ApplicationStore, UserStore]
  },

  getInitialState() {
    let state = this.getStore(UserStore).getState();
    let users = state.users.map((user) => {
      user.selected = false;
      return user;
    });
    state.users = users;
    return state;
  },

  onChange() {
    const state = this.getStore(UserStore).getState();

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
    this.context.router.transitionTo(
      `/admin/users/page/${perpage}/1`
    );
  },

  goToCreateUser(e) {
    e.preventDefault();
    this.context.router.transitionTo(`/admin/users/create`);
  },

  handleCheckAll() {
    const value = this.refs.globalSelector.getDOMNode().checked;
    const users = this.state.users.map((user) => {
      user.selected = value;
      return user;
    });
    this.setState({users});
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

    return (
      <div>
        <h1>Users</h1>
        <div>
          <button
            className="button-primary"
            onClick={this.goToCreateUser}>
            Create user
          </button>
        </div>
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
                <button>
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
  }
})
