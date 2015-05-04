'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import PageForm from './PageForm';
import {autoBindAll} from '../../../../utils';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';
import ConfirmationPopup from '../ConfirmationPopup';
import {editPageAction, deletePageAction} from '../../../actions/pageActions';
const debug = require('debug')('Component:Page');
debug();

class Page extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleDelete',
      'handleSubmit',
      'handleConfirmedDelete'
    ]);
    debug('PROPS');
    debug(props);

    let state = props.store.singlePage;
    state.show = false;
    this.state = state;

  }

  static displayName = 'Page'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  componentWillReceiveProps(nextProps) {
    let state = nextProps.store.singlePage;
    this.setState(state);
  }

  handleDelete(e) {
    e.preventDefault();
    this.setState({show: true});
  }

  handleSubmit(formState) {
    this.context.executeAction(editPageAction, formState);
  }

  handleConfirmedDelete() {
    let payload = this.state;
    payload.router = this.context.router;
    this.context.executeAction(deletePageAction, payload);
  }

  render() {
    return (
      <div>
        <PageForm {...this.state} handleSubmit={this.handleSubmit} />

        <button onClick={this.handleDelete}>Delete Page</button>
        <ConfirmationPopup
          show={this.state.show}
          onHide={() => this.setState({show: false})}
          onConfirm={this.handleConfirmedDelete}
        />
      </div>
    );
  }
}

Page = connectToStores(Page, ['PageStore'], (stores) => {
  return {
    store: stores.PageStore.getState()
  };
});

export default Page;
