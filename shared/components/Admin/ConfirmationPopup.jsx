'use strict';

import React, {Component, PropTypes as pt} from 'react';
import ModalWrapper from '../Modal';
const debug = require('debug')('Component:ConfirmationPopup');
debug();

export default class ConfirmationPopup extends Component {

  constructor(props) {
    super(props);
  }

  static displayName = 'ConfirmationPopup'

  static defaultProps = {
    confirmationText: 'Are you sure?',
    confirmationButton: 'Yes'
  }

  static propTypes = {
    onConfirm: pt.func.isRequired,
    show: pt.bool,
    onHide: pt.func.isRequired,
    confirmationText: pt.string,
    confirmationButton: pt.string
  }

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  render() {
    return (
      <ModalWrapper
        title="Confirm"
        show={this.props.show}
        onHide={this.props.onHide}>
        {this.props.confirmationText}

        <button className="warning" onClick={this.props.onConfirm}>
          {this.props.confirmationButton}
        </button>
      </ModalWrapper>
    );
  }
}
