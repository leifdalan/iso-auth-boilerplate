'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../../../stores/ApplicationStore';
import PageStore from '../../../stores/PageStore';
import {isClient, autoBindAll, getTimeAgo} from '../../../../utils';
import {merge, get, include} from 'lodash';
import {updateResultsAction, editManyPagesAction} from '../../../actions/pageActions';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';
import {setPageUserPrefAction} from '../../../actions/appActions';
import PageForm from './PageForm';

import ResultsNavigator from '../ResultsNavigator';
const debug = require('debug')('Component:Pages');

class AdminPageBrowser extends Component {

  constructor(props) {
    super(props);
    debug(this);
    autoBindAll.call(this, [
      'goToCreatePage',
      '_setHighlightedMarkup'
    ]);

    let state = props.pageStore;

    const pages = state.pages.map((page) => {
      page.selected = false;
      if (state.search) {
        const searchLetters = state.search.split('');
        page.title =
          this._setHighlightedMarkup(page.title, searchLetters);
      }

      page.lastUpdated = getTimeAgo(page.lastUpdated);

      return page;
    });

    state = merge(state, {
      pages,
      showConfirm: false,
      show: false
    });

    state.pageAdjustment && this._adjustPageBounds(state);
    debug('PAGE STATE', state);
    this.state = state;

  }

  static displayName = 'AdminPageBrowser'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    appStore: pt.object.isRequired,
    pageStore: pt.object.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  goToCreatePage(e) {
    e.preventDefault();
    this.context.router.transitionTo('createPage');
  }

  componentWillMount() {
    const appState = this.props.appStore;
    const routes = appState.route.routes;
    const currentRouteName = routes[routes.length - 1].name;
    let tablePropChoices;
    debug('CurrentRoute', currentRouteName);

    tablePropChoices =
      get(appState, `pageUserPref[${currentRouteName}].tablePropChoices`) ||
      [
        {
          label: 'Title',
          valueProp: 'title',
          selected: true
        },
        {
          label: 'Last Updated',
          valueProp: 'lastUpdated'
        },
        {
          label: 'Slug',
          valueProp: 'slug'
        },
        {
          label: 'Created By',
          valueProp: 'user.local.email',
          selected: true
        }
      ];

    this.context.executeAction(setPageUserPrefAction, {
      route: currentRouteName,
      preference: {tablePropChoices}
    });

    this.setState({tablePropChoices});
  }

  componentWillReceiveProps(nextProps) {

    let state = nextProps.pageStore;
    const pages = state.pages.map((page) => {
      page.lastUpdated = getTimeAgo(page.lastUpdated);
      if (state.search) {
        const searchLetters = state.search.split('');
        page.title =
          this._setHighlightedMarkup(page.title, searchLetters);
      }
      page.lastUpdated = getTimeAgo(page.lastUpdated);
      return page;
    });
    state.pages = pages;
    state.pageAdjustment && this._adjustPageBounds(state);

    this.setState(state);
  }

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

  render() {

    return (
      <div>
        <h1>Pages</h1>
        <div>
          <button
            className="button-primary"
            onClick={this.goToCreatePage}>
            Create page
          </button>
        </div>

        <ResultsNavigator
          loadingProperties={this.props.appStore.inPageLoadingProperties}
          label="Pages"
          items={this.state.pages}
          totalItems={this.props.pageStore.totalPages}
          updateResultsAction={updateResultsAction}
          collection={this.state.pages}
          perPagePlaceholder={`Pages per page (${this.state.perpage})`}
          tablePropChoices={this.state.tablePropChoices}
          neighborDepth={1}
          pathBase="/admin/pages/page/"
          editForm={PageForm}
          editManyAction={editManyPagesAction}
          basePath="/admin/pages/"
          editable
          {...this.props.pageStore}
          />
      </div>
    );
  }
}

AdminPageBrowser = connectToStores(AdminPageBrowser, [ApplicationStore, PageStore], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState(),
    pageStore: stores.PageStore.getState()
  };
});

export default AdminPageBrowser;
