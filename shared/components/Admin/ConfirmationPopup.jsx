'use strict';
import React from 'react';
import Modal from '../Modal';
const rpt = React.PropTypes;


export default React.createClass({
  displayName: 'ConfirmationPopup',

  getDefaultProps() {
    return {
      confirmationText: 'Are you sure?',
      confirmationButton: 'Yes'
    };
  },

  propTypes: {
    onConfirm: rpt.func.isRequired
  },

  render() {
    return (
      <Modal
        title="Confirm"
        show={this.props.show}
        onHide={this.props.onHide}>
        {this.props.confirmationText}

        <button className="warning" onClick={this.props.onConfirm}>
          {this.props.confirmationButton}
        </button>
      </Modal>

    );
  }
})
