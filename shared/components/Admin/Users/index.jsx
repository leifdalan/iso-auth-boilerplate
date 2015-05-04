'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import {isClient, autoBindAll, trace, getTimeAgo} from '../../../../utils';
import {merge, get, include} from 'lodash';
import {updateResultsAction, editManyUsersAction} from '../../../actions/userActions';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';
import {setPageUserPrefAction} from '../../../actions/appActions';
import UserForm from './UserForm';

import ResultsNavigator from '../ResultsNavigator';
const debug = require('debug')('Component:Pages');

class AdminUserBrowser extends Component {

  constructor(props) {
    super(props);
    debug(this);
    autoBindAll.call(this, [
      '_setHighlightedMarkup',
      'goToCreateUser'
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

  static displayName = 'AdminUserBrowser'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    appStore: pt.object.isRequired,
    userStore: pt.object.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  componentWillMount() {
    trace(this);
    debug('TYPEOF', typeof this.props.userStore);
    const appState = this.props.appStore;
    const routes = appState.route.routes;
    const currentRouteName = routes[routes.length - 1].name;
    let tablePropChoices;
    debug('CurrentRoute', currentRouteName);

    tablePropChoices =
      get(appState, `pageUserPref[${currentRouteName}].tablePropChoices`) ||
      [
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
        include(searchLetters, letter) ?
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

  goToCreateUser(e) {
    e.preventDefault();
    this.context.router.transitionTo('createUser');
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
          loadingProperties={this.props.appStore.inPageLoadingProperties}
          label="Users"
          items={this.state.users}
          totalItems={this.props.userStore.totalUsers}
          updateResultsAction={updateResultsAction}
          collection={this.state.users}
          perPagePlaceholder={`Users per page (${this.state.perpage})`}
          tablePropChoices={this.state.tablePropChoices}
          neighborDepth={1}
          pathBase="/admin/users/page/"
          editForm={UserForm}
          editManyAction={editManyUsersAction}
          basePath="/admin/users/"
          editable
          {...this.props.userStore}
          />

      </div>
    );
  }
}

AdminUserBrowser = connectToStores(
  AdminUserBrowser, ['ApplicationStore', 'UserStore'], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState(),
    userStore: stores.UserStore.getState()
  };
});

export default AdminUserBrowser;
