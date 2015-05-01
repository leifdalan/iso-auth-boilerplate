'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../../../stores/ApplicationStore';
import UserStore from '../../../stores/UserStore';
import {
  isClient, upsertQuery, getTimeAgo, autoBindAll, error, trace
} from '../../../../utils';
import _, {merge} from 'lodash';
import navigateAction from '../../../actions/navigate';
import {flashMessageAction, setPageUserPrefAction} from '../../../actions/appActions';
import {updateResultsAction, editManyUsersAction} from '../../../actions/userActions';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';

import ModalWrapper from '../../Modal';
import ConfirmationPopup from '../ConfirmationPopup';
import UserForm from './UserForm';

import ResultsNavigator from '../ResultsNavigator';
const debug = require('debug')('Component:Users');
debug();

class AdminItemBrowser extends Component {

  constructor(props) {
    super(props);
    debug(this);
    autoBindAll.call(this, [
      '_setHighlightedMarkup',
      '_setHighlightedMarkup',
      '_adjustPageBounds',
      'handlePerPageInput',
      'handlePerPageButton',
      'goToCreateUser',
      'handleCheckAll',
      'handleSearchInput',
      'handleCheck',
      'handleSort',
      'handleBulkEdit',
      'handleBulkEditConfirmation',
      'handleBulkEditClick',
      'handleTablePropChange'
    ]);

    let state = props.userStore;

    const users = state.users.map((user) => {
      user.selected = false;
      user.email = user.local.email;
      if (state.search) {
        const searchLetters = state.search.split('');
        user.email =
          this._setHighlightedMarkup(user.email, searchLetters);
      }

      user.lastUpdated = getTimeAgo(user.lastUpdated);

      return user;
    });

    state = merge(state, {
      users,
      showConfirm: false,
      show: false
    });

    state.pageAdjustment && this._adjustPageBounds(state);

    this.state = state;

  }

  static displayName = 'AdminItemBrowser'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  componentWillMount() {
    trace(this);
    const appState = this.props.appStore;
    const routes = appState.route.routes;
    const currentRouteName = routes[routes.length - 1].name;
    let tablePropChoices;
    debug('CurrentRoute', currentRouteName);

    // TODO: there's gotta be a better way to do this.
    if (appState.pageUserPref &&
      appState.pageUserPref[currentRouteName] &&
      appState.pageUserPref[currentRouteName].tablePropChoices) {
      tablePropChoices =
        appState.pageUserPref[currentRouteName].tablePropChoices;
    } else {
      tablePropChoices = [
        {
          label: 'Name',
          valueProp: 'email',
          selected: true
        },
        {
          label: 'Login Token',
          valueProp: 'loginToken'
        },
        {
          label: 'Level',
          valueProp: 'userLevel',
          selected: true
        },

        // TODO: dates seem to be broken in the DB...
        // {
        //   label: 'Last Updated',
        //   valueProp: 'lastUpdated'
        // },

        {
          label: 'Validated?',
          valueProp: 'isValidated'
        }
      ];

      this.context.executeAction(setPageUserPrefAction, {
        route: currentRouteName,
        preference: {tablePropChoices}
      });
    }
    this.setState({tablePropChoices});
  }

  componentWillReceiveProps(nextProps) {

    let state = nextProps.userStore;
    const users = state.users.map((user) => {
      user.email = user.local.email;
      user.lastUpdated = getTimeAgo(user.lastUpdated);
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

  }

  //
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
  }

  _adjustPageBounds(state) {
    if (isClient()) {
      const pathArray = window.location.pathname.split('/');
      const queryString = window.location.search;
      pathArray[5] = state.currentPageNumber;

      window.history.replaceState({}, {}, `${pathArray.join('/')}${queryString}`);
    }
  }

  //
  handlePerPageInput(e) {
    this.setState({
      perPageInput: e.target.value > 200 ? 200 : e.target.value
    });
  }
  //
  handlePerPageButton(e) {
    e.preventDefault();
    const perpage = this.state.perPageInput || this.state.perpage;

    this.context.router.transitionTo(
      `/admin/users/page/${perpage}/1${window.location.search}`
    );
  }

  goToCreateUser(e) {
    e.preventDefault();
    this.context.router.transitionTo('createUser');
  }

  //
  handleCheckAll(e) {
    const value = e.target.checked;
    const users = this.state.users.map((user) => {
      user.selected = value;
      return user;
    });
    this.setState({users});
  }

  //
  handleSearchInput(e) {
    this.setState({
      searchValue: e.target.value
    });

    if (e.target.value.length === 0 && isClient()) {

      // Remove query string if the search bar is empty. It's ugly.
      window.history.replaceState({}, {}, window.location.href.split('?')[0]);
    } else {
      const query = upsertQuery('s', e.target.value);
      window.history.replaceState({}, {}, query);
    }

    this.context.executeAction(updateResultsAction, {
      url: window.location.href,
      loadingProperty: 'search'
    });
  }

  //
  handleCheck(_id) {
    const users = this.state.users.map((user) => {
      user.selected = user._id === _id ? !user.selected : user.selected;
      return user;
    });
    this.setState({users});
  }

//
  handleSort(e) {
    let criteria = e.target.value;
    if (criteria === 'noop') {
      return;
    }
    e.preventDefault();
    debug(criteria);
    const query = upsertQuery('sort', criteria);
    window.history.replaceState({}, {}, query);
    this.context.executeAction(updateResultsAction, {
      url: window.location.href,
      loadingProperty: 'sort'
    });
  }
//
  handleBulkEdit(formValues) {
    error(formValues);
    this.setState({
      showConfirm: true,
      bulkEditFormValues: formValues
    })
  }

  handleBulkEditConfirmation() {
    const users = _.filter(this.state.users, (user) => user.selected);
    const formValues = this.state.bulkEditFormValues;
    this.context.executeAction(editManyUsersAction, {formValues, users});
    this.setState({
      show: false,
      showConfirm: false
    });
  }

  handleBulkEditClick() {
    const users = _.filter(this.state.users, (user) => user.selected);
    if (users.length === 0) {
      this.context.executeAction(flashMessageAction,
        'Please select some users to bulk edit first.');
    } else {
      this.setState({
        userCount: users.length,
        show: true
      });
    }
  }

  handleTablePropChange(valueProp) {
    const tablePropChoices = this.state.tablePropChoices.map((propChoice) => {
      if (propChoice.valueProp === valueProp) {
        propChoice.selected = !propChoice.selected;
      }
      return propChoice;
    });
    this.setState({tablePropChoices});

    const routes = this.context.router.getCurrentRoutes();
    const currentRouteName = routes[routes.length - 1].name;

    this.context.executeAction(setPageUserPrefAction, {
      route: currentRouteName,
      preference: {tablePropChoices}
    });
  }

  render() {

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

        <ResultsNavigator
          label="Users"
          itemStore={this.props.userStore}
          collection={this.state.users}
          tablePropChoices={this.state.tablePropChoices}
          pathBase="/admin/users/page/"
          basePath="/admin/users/"


          loadingProperties={this.props.appStore.inPageLoadingProperties}
          handleSearchInput={this.handleSearchInput}
          searchValue={this.state.searchValue}
          search={this.props.userStore.search}
          handlePerPageInput={this.handlePerPageInput}
          perPageValue={this.state.perPageInput}
          perPagePlaceholder={`Users per page (${this.state.perpage})`}
          handlePerPageButton={this.handlePerPageButton}
          handleSort={this.handleSort}

          handleTablePropChange={this.handleTablePropChange}
          currentPageNumber={this.state.currentPageNumber}
          totalItems={this.state.totalUsers}
          perpage={this.state.perpage}
          neighborDepth={1}


          handleCheckAll={this.handleCheckAll}
          handleBulkEditClick={this.handleBulkEditClick}
          handleCheck={this.handleCheck}

        />

        <ModalWrapper
          title={`Bulk editing ${this.state.userCount} Users`}
          show={this.state.show}
          onHide={() => this.setState({show: false, showConfirm: false})}>

          <UserForm handleSubmit={this.handleBulkEdit} />

          <ConfirmationPopup
            show={!!this.state.showConfirm}
            onHide={() => this.setState({showConfirm: false})}
            onConfirm={this.handleBulkEditConfirmation}
            confirmationText={
              `You sure you want to edit ${this.state.userCount} at a time?`
            }
          />

      </ModalWrapper>

      </div>
    );
  }
}

AdminItemBrowser = connectToStores(AdminItemBrowser, [ApplicationStore, UserStore], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState(),
    userStore: stores.UserStore.getState()
  };
});

export default AdminItemBrowser;
