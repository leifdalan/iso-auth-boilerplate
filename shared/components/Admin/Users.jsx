'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserStore from '../../stores/UserStore';
import navigateAction from '../../actions/navigate';
import {flashMessageAction} from '../../actions/appActions';
import Paginator from './Paginator';
import {CheckAdminMixin} from '../../mixins/authMixins';
import {updateResultsAction, editManyUsersAction} from '../../actions/userActions';
import {isClient, upsertQuery} from '../../../utils';
import Modal from 'react-bootstrap-modal';
import UserForm from './UserForm';
import _ from 'lodash';
// const debug = require('debug')('Component:Users');


export default React.createClass({
  displayName: 'Users',

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin, CheckAdminMixin],

  statics: {
    storeListeners: [UserStore]
  },

  _setHighlightedMarkup(string, searchLetters) {
    if (typeof string === 'string') {
      let markup = [].map.call(string, (letter) =>
        _.include(searchLetters, letter) ?
          <span className="search-term">{letter}</span> :
          <span>{letter}</span>
      );
      const userMarkup = <span>{markup}</span>;

      return userMarkup;
    }
    return string;
  },

  getInitialState() {
    let state = this.getStore(UserStore).getState();
    const users = state.users.map((user) => {
      user.selected = false;

      if (state.search) {
        const searchLetters = state.search.split('');
        user.local.email =
          this._setHighlightedMarkup(user.local.email, searchLetters);
      }

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
    if (state.search) {
      const searchLetters = state.search.split('');
      state.users.map((user) =>
        user.local.email =
          this._setHighlightedMarkup(user.local.email, searchLetters)
      );
    }
    state.pageAdjustment && this._adjustPageBounds(state);
    this.setState(state);
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
      `/admin/users/page/${perpage}/1${window.location.search}`
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
      const query = upsertQuery('s', e.target.value);
      window.history.replaceState({}, {}, query);
    }

    this.executeAction(updateResultsAction, window.location.href);

  },

  handleCheck(_id) {
    const users = this.state.users.map((user) => {
      user.selected = user._id === _id ? !user.selected : user.selected;
      return user;
    });
    this.setState({users});
  },

  handleSort(e) {
    const criteria = e.target.value;
    e.preventDefault();
    const query = upsertQuery('sort', criteria);
    window.history.replaceState({}, {}, query);
    this.executeAction(updateResultsAction, window.location.href);
  },

  handleBulkEdit(formValues) {
    const users = _.filter(this.state.users, (user) => user.selected);
    this.executeAction(editManyUsersAction, {formValues, users});
    this.setState({show: false});
  },

  handleBulkEditClick() {
    const users = _.filter(this.state.users, (user) => user.selected);
    if (users.length === 0) {
      this.executeAction(flashMessageAction,
        'Please select some users to bulk edit first.');
    } else {
      this.setState({
        userCount: users.length,
        show: true
      });
    }
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

        <div>
          <label htmlFor="sorting">Sort by:</label>

          <select id="sorting" onChange={this.handleSort}>
            <option value="userLevel|asc">User Level &#9652;</option>
            <option value="userLevel|desc">User Level &#9662;</option>
            <option value="local.email|asc">User Name &#9652;</option>
            <option value="local.email|desc">User Name &#9662;</option>
            <option value="lastUpdated|asc">Last Edited &#9652;</option>
            <option value="lastUpdated|desc">Last Edited &#9662;</option>
          </select>
        </div>

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
              <td>
                Username
              </td>
              <td>User Level</td>
              <td>
                <button onClick={this.handleBulkEditClick}>
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
                    onClick={() =>
                      this.context.router.transitionTo(`/admin/users/${user._id}`)}>
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
        <Modal
          show={this.state.show}
          onHide={() => this.setState({show: false})}
          aria-labelledby="ModalHeader">

          <Modal.Header closeButton>
            <Modal.Title id='ModalHeader'>
              Bulk editing {this.state.userCount} Users
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <UserForm handleSubmit={this.handleBulkEdit} />
          </Modal.Body>
          <Modal.Footer>
            <Modal.Dismiss className='btn btn-default'>Cancel</Modal.Dismiss>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
})
