'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import UserForm from './UserForm';
import {CheckAdminMixin} from '../../mixins/authMixins';
import {createUserAction} from '../../actions/userActions';

export default React.createClass({
  displayName: 'CreateUser',

  contextTypes: {
    router: React.PropTypes.func
  },

  handleSubmit(formValues) {
    this.executeAction(createUserAction, formValues);
  },

  mixins: [FluxibleMixin, CheckAdminMixin],

  render() {
    return (
      <UserForm handleSubmit={this.handleSubmit} buttonText="Create" />
    );
  }
})
