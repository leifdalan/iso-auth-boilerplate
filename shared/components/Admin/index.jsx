'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {CheckAdminWillTransitionTo} from '../../mixins/authMixins';
const debug = require('debug')('Component:AdminDashboard');
debug();

class AdminDashboard extends Component {

  constructor(props) {
    super(props);
  }

  static displayName = 'AdminDashboard'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  componentWillReceiveProps(nextProps) {
    const newState = nextProps.store;
    this.setState(newState);
  }

  render() {
    return (
      <div>Only users at level 3 or above...</div>
    );
  }
}

export default AdminDashboard;
