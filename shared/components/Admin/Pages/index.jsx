'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../../../stores/ApplicationStore';
import PageStore from '../../../stores/PageStore';
import {
  isClient, upsertQuery, getTimeAgo, autoBindAll, warn, error, trace
} from '../../../../utils';
import _, {merge} from 'lodash';
import navigateAction from '../../../actions/navigate';
import {flashMessageAction, setPageUserPrefAction} from '../../../actions/appActions';
import {updateResultsAction, editManyPagesAction} from '../../../actions/pageActions';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';

import ModalWrapper from '../../Modal';
import ConfirmationPopup from '../ConfirmationPopup';
import PageForm from './PageForm';

import ResultsNavigator from '../ResultsNavigator';
const debug = require('debug')('Component:Pages');
debug();

class AdminItemBrowser extends Component {

  constructor(props) {
    super(props);
    debug(this);
    autoBindAll.call(this, [
      '_setHighlightedMarkup',
      '_adjustPageBounds',
      'handlePerPageInput',
      'handlePerPageButton',
      'goToCreatePage',
      'handleCheckAll',
      'handleSearchInput',
      'handleCheck',
      'handleSort',
      'handleBulkEdit',
      'handleBulkEditConfirmation',
      'handleBulkEditClick',
      'handleTablePropChange'
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
          label: 'Title',
          valueProp: 'title',
          selected: true
        },
        {
          label: 'Last Updated',
          valueProp: 'lastUpdated'
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

    let state = nextProps.pageStore;
    const pages = state.pages.map((page) => {
      page.lastUpdated = getTimeAgo(page.lastUpdated);
      if (state.search) {
        const searchLetters = state.search.split('');
        page.title =
          this._setHighlightedMarkup(page.title, searchLetters);
      }

      return page;
    });
    state.pages = pages;
    state.pageAdjustment && this._adjustPageBounds(state);
    this.setState(state);

  }

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

  handlePerPageInput(e) {
    this.setState({
      perPageInput: e.target.value > 200 ? 200 : e.target.value
    });
  }

  handlePerPageButton(e) {
    e.preventDefault();
    const perpage = this.state.perPageInput || this.state.perpage;

    this.context.router.transitionTo(
      `/admin/pages/page/${perpage}/1${window.location.search}`
    );
  }

  goToCreatePage(e) {
    e.preventDefault();
    this.context.router.transitionTo('createPage');
  }

  handleCheckAll(e) {
    const value = e.target.checked;
    const pages = this.state.pages.map((page) => {
      page.selected = value;
      return page;
    });
    this.setState({pages});
  }

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

    this.context.executeAction(updateResultsAction, window.location.href);
  }

  handleCheck(_id) {
    const pages = this.state.pages.map((page) => {
      page.selected = page._id === _id ? !page.selected : page.selected;
      return page;
    });
    this.setState({pages});
  }

  handleSort(e) {
    let criteria = e.target.value;
    if (criteria === 'noop') {
      return;
    }
    e.preventDefault();
    debug(criteria);
    const query = upsertQuery('sort', criteria);
    window.history.replaceState({}, {}, query);
    this.context.executeAction(updateResultsAction, window.location.href);
  }

  handleBulkEdit(formValues) {
    error(formValues);
    this.setState({
      showConfirm: true,
      bulkEditFormValues: formValues
    })
  }

  handleBulkEditConfirmation() {
    const pages = _.filter(this.state.pages, (page) => page.selected);
    const formValues = this.state.bulkEditFormValues;
    this.context.executeAction(editManyPagesAction, {formValues, pages});
    this.setState({
      show: false,
      showConfirm: false
    });
  }

  handleBulkEditClick() {
    const pages = _.filter(this.state.pages, (page) => page.selected);
    if (pages.length === 0) {
      this.context.executeAction(flashMessageAction,
        'Please select some pages to bulk edit first.');
    } else {
      this.setState({
        pageCount: pages.length,
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
        <h1>Pages</h1>
        <div>
          <button
            className="button-primary"
            onClick={this.goToCreatePage}>
            Create page
          </button>
        </div>

        <ResultsNavigator
          label="Pages"
          handleSearchInput={this.handleSearchInput}
          searchValue={this.state.search}
          handlePerPageInput={this.handlePerPageInput}
          perPageValue={this.state.perPageInput}
          perPagePlaceholder={`Pages per page (${this.state.perpage})`}
          handlePerPageButton={this.handlePerPageButton}
          handleSort={this.handleSort}
          tablePropChoices={this.state.tablePropChoices}
          handleTablePropChange={this.handleTablePropChange}
          currentPageNumber={this.state.currentPageNumber}
          totalItems={this.state.totalUsers}
          perpage={this.state.perpage}
          neighborDepth={1}
          pathBase="/admin/pages/page/"
          collection={this.state.pages}
          handleCheckAll={this.handleCheckAll}
          handleBulkEditClick={this.handleBulkEditClick}
          handleCheck={this.handleCheck}
          basePath="/admin/pages/"
        />

        <ModalWrapper
          title={`Bulk editing ${this.state.pageCount} Pages`}
          show={this.state.show}
          onHide={() => this.setState({show: false, showConfirm: false})}>

          <PageForm handleSubmit={this.handleBulkEdit} />

          <ConfirmationPopup
            show={!!this.state.showConfirm}
            onHide={() => this.setState({showConfirm: false})}
            onConfirm={this.handleBulkEditConfirmation}
            confirmationText={
              `You sure you want to edit ${this.state.pageCount} at a time?`
            }
          />

      </ModalWrapper>

      </div>
    );
  }
}

AdminItemBrowser = connectToStores(AdminItemBrowser, [ApplicationStore, PageStore], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState(),
    pageStore: stores.PageStore.getState()
  }
});

export default AdminItemBrowser;
