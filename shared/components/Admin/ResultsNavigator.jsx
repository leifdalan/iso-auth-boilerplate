'use strict';

import React, {Component, PropTypes as pt} from 'react';
import Checkbox from '../Checkbox';
import Paginator from './Paginator';
import ResultsTable from './ResultsTable';
// import {connectToStores} from 'fluxible/addons';
// import asdf from '../stores/asdf';
// import {autoBindAll} from '../../utils';
const debug = require('debug')('Component:ResultsNavigator');
debug();

export default class ResultsNavigator extends Component {

  constructor(props) {
    super(props);
    this.state = props;
  }

  static displayName = 'ResultsNavigator'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {

  }

  componentWillReceiveProps(nextProps) {
    const newState = nextProps;
    this.setState(newState);
  }

  _shouldShowItemsPerPage() {
    return this.props.totalItems > this.props.perpage;
  }

  render() {

    const paginator = (
      <Paginator
        currentPageNumber={this.props.currentPageNumber}
        totalItems={this.props.totalItems}
        perpage={this.props.perpage}
        neighborDepth={this.props.neighborDepth}
        pathBase={this.props.pathBase}
      />
    );

    const tableProps =
      this.props.tablePropChoices.filter((tableProp) => tableProp.selected);

    const noUsers = (
      <h2>No users match{` "${this.state.search}"`}!</h2>
    );


    const resultsNavigator = (
      <div>
        {this._shouldShowItemsPerPage() &&
          <div>
            <input
              type="number"
              onChange={this.props.handlePerPageInput}
              value={this.props.perPageValue}
              placeholder={this.props.perPagePlaceholder}
            />
            <button
              onClick={this.props.handlePerPageButton}>
              {`Update ${this.props.label}/page`}
            </button>
          </div>
        }

        <div>
          <select id="sorting" onChange={this.props.handleSort}>
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
                  this.props.handleTablePropChange.bind(null, propChoice.valueProp)
                }
              />
            )}
          </div>

        </div>

        {paginator}

        {this.state.search &&
          <small>
            {`"${this.state.search}" matches ${this.state.totalItems} ${this.props.label}`}
          </small>
        }

        <ResultsTable
          properties={tableProps}
          collection={this.props.collection}
          handleCheckAll={this.props.handleCheckAll}
          handleBulkEditClick={this.props.handleBulkEditClick}
          handleCheck={this.props.handleCheck}
          basePath={this.props.basePath}
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
          onChange={this.props.handleSearchInput}
          value={this.props.searchValue}
          placeholder={`Search for ${this.props.label}`}
        />
        {body}
      </div>

    )
  }
}
