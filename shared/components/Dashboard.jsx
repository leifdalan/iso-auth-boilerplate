'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {CheckLoginWillTransitionTo} from '../mixins/authMixins';
import DocumentTitle from 'react-document-title';
const debug = require('debug')('Component:Dashboard');
debug();

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
  }

  static displayName = 'Dashboard'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckLoginWillTransitionTo

  render() {
    return (
      <DocumentTitle title="Dashboard">
        <div>
          <p>Here's your dashboard!</p>
        </div>
      </DocumentTitle>
    );
  }
}
