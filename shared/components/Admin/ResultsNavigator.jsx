'use strict';

import React, {Component, PropTypes as pt} from 'react';
import Checkbox from '../Checkbox';
import ModalWrapper from '../Modal';
import ConfirmationPopup from './ConfirmationPopup';
import Paginator from './Paginator';
import ResultsTable from './ResultsTable';
import Spinner from '../Spinner';
import {
  isClient,
  upsertQuery,
  autoBindAll,
  error
} from '../../../utils';
import {filter, include, includes} from 'lodash';
import {flashMessageAction, setPageUserPrefAction} from '../../actions/appActions';
const debug = require('debug')('Component:ResultsNavigator');
debug();

export default class ResultsNavigator extends Component {

  constructor(props) {
    super(props);

    autoBindAll.call(this, [
      '_setHighlightedMarkup',
      'handlePerPageInput',
      'handlePerPageButton',
      'handleCheckAll',
      'handleSearchInput',
      'handleCheck',
      'handleSort',
      'handleBulkEdit',
      'handleBulkEditConfirmation',
      'handleBulkEditClick',
      'handleTablePropChange'
    ]);

    this.state = props;
    this.state = props;
  }

  static displayName = 'ResultsNavigator'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static defaultProps = {
    neighborDepth: 2
  }

  static propTypes = {
    label: pt.string.isRequired,
    items: pt.array.isRequired,
    updateResultsAction: pt.func.isRequired,
    collection: pt.array.isRequired,
    tablePropChoices: pt.array.isRequired,
    pathBase: pt.string.isRequired,
    totalItems: pt.number.isRequired,
    loadingProperties: pt.array,
    perPagePlaceholder: pt.string,
    neighborDepth: pt.number,
    editForm: pt.func,
    editManyAction: pt.func,
    handleBulkEditClick: pt.func,
    basePath: pt.string,
    editable: pt.bool,
    perpage: pt.number,
    search: pt.string,
    currentPageNumber: pt.number
  }

  componentWillReceiveProps(nextProps) {
    const newState = nextProps;
    this.setState(newState);
  }

  /**
   * Takes a string and compares it against another substring,
   * and wraps all matching characters in a class'ed span tag
   * for CSS highlighting
   *
   * @param {String} string to compare to
   * @param {String} comparison characters
   * @return {Object} React component with/without class.
   * @public
   */
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

  _shouldShowItemsPerPage() {
    return true || this.props.totalItems > this.props.perpage;
  }

  handlePerPageInput(e) {
    debug('Pressing.', e.target.value);
    this.setState({
      perPageInput: e.target.value > 200 ? 200 : e.target.value
    });
  }

  handlePerPageButton(e) {
    e.preventDefault();
    const perpage = this.state.perPageInput || this.props.perpage;

    this.context.router.transitionTo(
      `${this.props.basePath}page/${perpage}/1${window.location.search}`
    );
  }

  handleCheckAll(e) {
    const value = e.target.checked;
    const items = this.state.items.map((item) => {
      item.selected = value;
      return item;
    });
    this.setState({items});
  }

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

    this.context.executeAction(this.props.updateResultsAction, {
      url: window.location.href,
      loadingProperty: 'search'
    });
  }

  handleCheck(_id) {
    const items = this.state.items.map((item) => {
      item.selected = item._id === _id ? !item.selected : item.selected;
      return item;
    });
    this.setState({items});
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
    this.context.executeAction(this.props.updateResultsAction, {
      url: window.location.href,
      loadingProperty: 'sort'
    });
  }

  handleTablePropChange(valueProp) {
    const tablePropChoices = this.props.tablePropChoices.map((propChoice) => {
      if (propChoice.valueProp === valueProp) {
        propChoice.selected = !propChoice.selected;
      }
      return propChoice;
    });

    const routes = this.context.router.getCurrentRoutes();
    const currentRouteName = routes[routes.length - 1].name;

    this.context.executeAction(setPageUserPrefAction, {
      route: currentRouteName,
      preference: {tablePropChoices}
    });
  }

  handleBulkEdit(formValues) {
    error(formValues);
    this.setState({
      showConfirm: true,
      bulkEditFormValues: formValues
    });
  }

  handleBulkEditConfirmation() {
    const items = filter(this.state.items, (item) => item.selected);
    const formValues = this.state.bulkEditFormValues;
    this.context.executeAction(this.props.editManyAction, {formValues, items});
    this.setState({
      show: false,
      showConfirm: false
    });
  }

  handleBulkEditClick() {
    const items = filter(this.state.items, (item) => item.selected);
    if (items.length === 0) {
      this.context.executeAction(flashMessageAction,
        'Please select some items to bulk edit first.');
    } else {
      this.setState({
        pageCount: items.length,
        show: true
      });
    }
  }


  render() {
    const paginator = (
      <Paginator
        currentPageNumber={this.props.currentPageNumber}
        totalItems={this.props.totalItems}
        perpage={this.props.perpage}
        neighborDepth={this.props.neighborDepth}
        pathBase={`${this.props.basePath}page/`}
      />
    );

    const tableProps =
      this.props.tablePropChoices.filter((tableProp) => tableProp.selected);

    const noUsers = (
      <div>
        {this.props.search ?
          <h2>No items match{` "${this.props.search}"`}!</h2> :
          <h2>No {this.props.label} have been made yet. Create one!</h2>
        }
      </div>

    );


    const resultsNavigator = (
      <div>
        {this._shouldShowItemsPerPage() &&
          <div>
            <input
              type="number"
              onChange={this.handlePerPageInput}
              value={this.state.perPageInput}
              placeholder={this.props.perPagePlaceholder}
            />
            <button
              onClick={this.handlePerPageButton}>
              {`Update ${this.props.label}/page`}
            </button>
          </div>
        }

        <div>
          <select id="sorting" onChange={this.handleSort}>
            <option value="noop">Sort by</option>
            {tableProps.map((propChoice) =>
              <option
                key={propChoice.valueProp}
                value={`${propChoice.valueProp}|asc`}>{propChoice.label} &#9652;
              </option>
              )
            }
            {tableProps.map((propChoice) =>
              <option
                key={propChoice.valueProp}
                value={`${propChoice.valueProp}|desc`}>{propChoice.label} &#9662;
              </option>
              )
            }
          </select>
          {includes(this.props.loadingProperties, 'sort') &&
            <Spinner className='sort-spinner' />
          }
        </div>

        <div>
          <label htmlFor="tableColumns">Table columns:</label>

          <div id="tableColumns" onChange={(e) => debug(e)}>
            {this.props.tablePropChoices.map((propChoice) =>
              <Checkbox
                key={`Checkbox${propChoice.valueProp}`}
                inputKey={propChoice.valueProp}
                label={propChoice.label}
                checked={propChoice.selected}
                onChangeCallback={
                  this.handleTablePropChange.bind(null, propChoice.valueProp)
                }
              />
            )}
          </div>

        </div>

        {paginator}

        {this.props.search &&
          <small>
            {`"${this.props.search}" matches ${this.props.totalItems} ${this.props.label}`}
          </small>
        }

        <ResultsTable
          properties={tableProps}
          collection={this.state.items}
          handleCheckAll={this.handleCheckAll}
          handleBulkEditClick={this.handleBulkEditClick}
          handleCheck={this.handleCheck}
          basePath={this.props.basePath}
          editable={this.props.editable}
        />

        {paginator}

      </div>
    );

    const body = this.props.collection.length ? resultsNavigator : noUsers;

    return (
      <div>
        <input
          className="user-search"
          type="search"
          onChange={this.handleSearchInput}
          value={this.state.searchValue ||  this.props.search}
          placeholder={`Search for ${this.props.label}`}
        />
        {includes(this.props.loadingProperties, 'search') &&
          <Spinner className='search-spinner' />
        }

        {body}

        {this.props.editable &&
          <ModalWrapper
            title={`Bulk editing ${this.state.pageCount} Pages`}
            show={this.state.show}
            onHide={() => this.setState({show: false, showConfirm: false})}>

            <this.props.editForm handleSubmit={this.handleBulkEdit} />

            <ConfirmationPopup
              show={!!this.state.showConfirm}
              onHide={() => this.setState({showConfirm: false})}
              onConfirm={this.handleBulkEditConfirmation}
              confirmationText={
                `You sure you want to edit ${this.state.pageCount} at a time?`
              }
            />

          </ModalWrapper>
        }
      </div>

    );
  }
}
