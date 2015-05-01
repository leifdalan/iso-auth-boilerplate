'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {autoBindAll} from '../../../../utils';
import UserForm from './UserForm';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';
import {createUserAction} from '../../../actions/userActions';

const debug = require('debug')('Component:CreateUser');
debug();

export default class CreateUser extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleSubmit'
    ]);
  }

  static displayName = 'CreateUser'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  handleSubmit(formValues) {
    const router = this.context.router;
    this.context.executeAction(createUserAction, {
      formValues,
      router
    });
  }

  render() {
    return (
      <UserForm handleSubmit={this.handleSubmit} buttonText="Create" />
    );
  }
}
