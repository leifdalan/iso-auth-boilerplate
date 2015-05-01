'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {autoBindAll} from '../../../utils';
import classnames from 'classnames';
const debug = require('debug')('Component:PaginatorLink');
debug();

export default class PaginatorLink extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'navigate'
    ]);
    this.state = props.store;
  }

  static displayName = 'PaginatorLink'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    pathBase: React.PropTypes.string.isRequired,
    pagenumber: React.PropTypes.number.isRequired,
    perpage: React.PropTypes.number.isRequired,
    currentPageNumber: React.PropTypes.number.isRequired,
    children: React.PropTypes.node
  }

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
  }

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
}
