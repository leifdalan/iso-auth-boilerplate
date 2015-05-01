'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import PaginatorLink from './PaginatorLink';
import {autoBindAll} from '../../../utils';
const debug = require('debug')('Component:Paginator');
debug();

export default class Paginator extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      '_getTotalPages',
      '_shouldShowNext',
      '_shouldShowPrev',
      '_constructMiddle'
    ]);
    this.state = {
      totalPages: this._getTotalPages(props)
    };
  }

  static displayName = 'Paginator'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    currentPageNumber: pt.number.isRequired,
    totalItems: pt.number.isRequired,
    perpage: pt.number.isRequired,
    pathBase: pt.string.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const totalPages = this._getTotalPages(nextProps);
    if (totalPages) {
      this.setState({
        totalPages: this._getTotalPages(nextProps)
      });
    }
  }

  _getTotalPages(props) {
    const {totalItems, perpage} = props;
    let totalPages = totalItems / perpage;
    const remainder = totalItems % perpage;
    totalPages = remainder ? Math.floor(totalPages) + 1 : totalPages;
    return totalPages;
  }

  _shouldShowNext() {
    const {currentPageNumber, neighborDepth} = this.props;
    return currentPageNumber < this.state.totalPages - neighborDepth;
  }

  _shouldShowPrev() {
    return this.props.currentPageNumber > 1;
  }

  _constructMiddle() {

    let atEnd, atBeginning, middleMarkup = [];
    const {currentPageNumber, neighborDepth} = this.props,
          {totalPages} = this.state;

    for (let i = currentPageNumber - neighborDepth; i < currentPageNumber; i++) {
      if (i > 0) {
        middleMarkup.push(
          <PaginatorLink
            currentPageNumber={this.props.currentPageNumber}
            pathBase={this.props.pathBase}
            pagenumber={i}
            key={i}
            perpage={this.props.perpage}
          />
        );
      }

      if (i < (neighborDepth + 1)) {
        atBeginning = true;
      }
    }

    if (!atBeginning) {
      middleMarkup.unshift(<span key="begin"> ... </span>);
      middleMarkup.unshift(
        <PaginatorLink
          currentPageNumber={this.props.currentPageNumber}
          pathBase={this.props.pathBase}
          pagenumber={1}
          key={1}
          perpage={this.props.perpage}
        />
      );
    }

    for (let i = currentPageNumber; i <= currentPageNumber + neighborDepth; i++) {
      if (i <= (totalPages)) {
        middleMarkup.push(
          <PaginatorLink
            currentPageNumber={this.props.currentPageNumber}
            pathBase={this.props.pathBase}
            pagenumber={i}
            key={i}
            perpage={this.props.perpage}
          />
        );
      }
      if (i >= (totalPages - neighborDepth)) {
        atEnd = true;
      }
    }
    if (!atEnd) {
      middleMarkup.push(<span key="end"> ... </span>);
      middleMarkup.push(
        <PaginatorLink
          currentPageNumber={this.props.currentPageNumber}
          pathBase={this.props.pathBase}
          pagenumber={totalPages}
          key={totalPages}
          perpage={this.props.perpage}
        />
      );
    }

    return middleMarkup;
  }

  render() {
    debug(this.props);
    const shouldrender = this.state.totalPages > 1;
    return (
      <div className="paginator">
        {this._shouldShowPrev() &&
          <PaginatorLink
            currentPageNumber={this.props.currentPageNumber}
            pathBase={this.props.pathBase}
            pagenumber={this.props.currentPageNumber - 1}
            perpage={this.props.perpage}>
            {'<<'}
          </PaginatorLink>

        }

        {shouldrender && this._constructMiddle().map((link) => link)}

        {this._shouldShowNext() &&
          <PaginatorLink
            currentPageNumber={this.props.currentPageNumber}
            pathBase={this.props.pathBase}
            pagenumber={this.props.currentPageNumber + 1}
            perpage={this.props.perpage}>
            {'>>'}
          </PaginatorLink>
        }
      </div>
    );
  }
}
