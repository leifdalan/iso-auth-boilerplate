'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classnames from 'classnames';
import UserStore from '../../stores/UserStore';
const debug = require('debug')('Component:PaginatorLink');

export default React.createClass({
  displayName: 'PaginatorLink',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    pathBase: React.PropTypes.string.isRequired,
    pagenumber: React.PropTypes.number.isRequired,
    perpage: React.PropTypes.number.isRequired,
    currentPageNumber: React.PropTypes.number.isRequired
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [UserStore]
  },

  getInitialState() {
    return this.getStore(UserStore).getState();
  },

  navigate() {
    debug(`${this.props.pathBase}${this.props.perpage}/${this.props.pagenumber}`);
    const query = window.location.href.split('?')[1] ?
      `?${window.location.href.split('?')[1]}` :
      ``;
    this
      .context
      .router
      .transitionTo(
        `${this.props.pathBase}${this.props.perpage}/${this.props.pagenumber}${query}`
      );
  },

  onChange() {
    const state = this.getStore(UserStore).getState();
    this.setState(state);
  },

  render() {
    const classes = classnames({
      'button-primary': this.props.pagenumber === this.props.currentPageNumber
    });
    return (
        <button className={classes} onClick={this.navigate}>
          {this.props.children || this.props.pagenumber}
        </button>
    );
  }
})
