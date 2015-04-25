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
import Checkbox from '../Checkbox';
import UserForm from './UserForm';
import ResultsTable from './ResultsTable';

import _ from 'lodash';
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
      user.email = user.local.email;
      if (state.search) {
        const searchLetters = state.search.split('');
        user.email =
          this._setHighlightedMarkup(user.email, searchLetters);
      }

      return user;
    });

    state.tablePropChoices = [
      {
        label: 'Username',
        valueProp: 'email',
        selected: true
      },
      {
        label: 'Login Token',
        valueProp: 'loginToken'
      },
      {
        label: 'User Level',
        valueProp: 'userLevel'
      },
      {
        label: 'Is Validated',
        valueProp: 'isValidated'
      }
    ]

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
    const users = state.users.map((user) => {
      user.email = user.local.email;
      if (state.search) {
        const searchLetters = state.search.split('');
        user.email =
          this._setHighlightedMarkup(user.email, searchLetters);
      }

      return user;
    });
    state.users = users;
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

  handleCheckAll(e) {
    const value = e.target.checked;
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

  handleTablePropChange(valueProp, e) {
    const tablePropChoices = this.state.tablePropChoices.map((propChoice) => {
      if (propChoice.valueProp === valueProp) {
        propChoice.selected = !propChoice.selected;
      }
      return propChoice;
    });
    this.setState({tablePropChoices})
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

    const tableProps =
      this.state.tablePropChoices.filter((tableProp) => tableProp.selected);

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
            {tableProps.map((propChoice) =>
              <option value={`${propChoice.valueProp}|asc`}>{propChoice.label} &#9652;</option>)
            }
            {tableProps.map((propChoice) =>
              <option value={`${propChoice.valueProp}|desc`}>{propChoice.label} &#9662;</option>)
            }


          </select>
        </div>
        <div>
          <label htmlFor="tableColumns">Table columns:</label>

          <div id="tableColumns" onChange={(e) => debug(e)}>
            {this.state.tablePropChoices.map((propChoice) =>
              <Checkbox
                inputKey={propChoice.valueProp}
                label={propChoice.label}
                checked={propChoice.selected}
                onChangeCallback={this.handleTablePropChange.bind(null, propChoice.valueProp)}
              />
            )}
          </div>

        </div>

        {paginator}

        {this.state.search &&
          <small>
            {`"${this.state.search}" matches ${this.state.totalUsers} users`}
          </small>
        }

        <ResultsTable
          properties={tableProps}
          collection={this.state.users}
          handleCheckAll={this.handleCheckAll}
          handleBulkEditClick={this.handleBulkEditClick}
          handleCheck={this.handleCheck}
          basePath="/admin/users/"
        />

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
