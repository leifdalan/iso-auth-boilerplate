'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserStore from '../../stores/UserStore';
import PaginatorLink from './PaginatorLink';
// const debug = require('debug')('Component:Paginator');


export default React.createClass({
  displayName: 'Paginator',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    currentPageNumber: React.PropTypes.number.isRequired,
    totalItems: React.PropTypes.number.isRequired,
    perpage: React.PropTypes.number.isRequired,
    pathBase: React.PropTypes.string.isRequired
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [UserStore]
  },

  _shouldShowNext() {
    const {currentPageNumber, neighborDepth} = this.props;
    return currentPageNumber < this.state.totalPages - neighborDepth;
  },

  _shouldShowPrev() {
    return this.props.currentPageNumber > 1;
  },

  componentWillMount() {
    const {totalItems, perpage} = this.props;
    let totalPages = totalItems / perpage;
    const remainder = totalItems % perpage;
    totalPages = remainder ? Math.floor(totalPages) + 1 : totalPages;

    this.setState({totalPages});
  },

  getInitialState() {

    return this.getStore(UserStore).getState();
  },

  onChange() {
    const state = this.getStore(UserStore).getState();
    this.setState(state);
  },

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
            perpage={this.props.perpage}
          />
        );
      }

      if (i < (neighborDepth + 1)) {
        atBeginning = true;
      }
    }

    if (!atBeginning) {
      middleMarkup.unshift(<span> ... </span>);
      middleMarkup.unshift(
        <PaginatorLink
          currentPageNumber={this.props.currentPageNumber}
          pathBase={this.props.pathBase}
          pagenumber={1}
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
            perpage={this.props.perpage}
          />
        );
      }
      if (i >= (totalPages - neighborDepth)) {
        atEnd = true;
      }
    }
    if (!atEnd) {
      middleMarkup.push(<span> ... </span>);
      middleMarkup.push(
        <PaginatorLink
          currentPageNumber={this.props.currentPageNumber}
          pathBase={this.props.pathBase}
          pagenumber={totalPages}
          perpage={this.props.perpage}
        />
      );
    }

    return middleMarkup;
  },

  render() {

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
})
