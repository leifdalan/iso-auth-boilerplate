'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import UserStore from '../../stores/UserStore';
import UserForm from './UserForm';
import {autoBindAll} from '../../../utils';
import {CheckAdminWillTransitionTo} from '../../mixins/authMixins';
import ConfirmationPopup from './ConfirmationPopup';
import {editUserAction, deleteUserAction} from '../../actions/userActions';
const debug = require('debug')('Component:User');
debug();

class User extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleDelete',
      'handleSubmit',
      'handleConfirmedDelete'
    ]);
    debug('PROPS');
    debug(props);
    let state = props.store.singleUser;
    state.originalPassword = state.local.password;

    this.state = state;
  }

  static displayName = 'User'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  componentWillReceiveProps(nextProps) {
    let state = nextProps.store.singleUser;
    state.originalPassword = state.local.password;
    this.setState(state);
  }

  handleDelete(e) {
    e.preventDefault();
    this.setState({show: true});
  }

  handleSubmit(formState) {
    this.context.executeAction(editUserAction, formState);
  }

  handleConfirmedDelete() {
    let payload = this.state;
    payload.router = this.context.router;
    this.context.executeAction(deleteUserAction, payload);
  }

  render() {
    return (
      <div>
        <UserForm {...this.state} handleSubmit={this.handleSubmit.bind(this)} />

        <button onClick={this.handleDelete}>Delete User</button>
        <ConfirmationPopup
          show={this.state.show}
          onHide={() => this.setState({show: false})}
          onConfirm={this.handleConfirmedDelete}
        />
      </div>
    );
  }
}

User = connectToStores(User, [UserStore], (stores) => {
  return {
    store: stores.UserStore.getState()
  }
});

export default User;
