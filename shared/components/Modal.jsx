'use strict';
import React from 'react';
import Modal from 'react-bootstrap-modal';
const rpt = React.PropTypes;


export default React.createClass({
  displayName: 'Modal',

  getDefaultProps() {
    return {
      ariaLabel: 'ModalHeader'
    };
  },

  propTypes: {
    show: rpt.bool.isRequired,
    onHide: rpt.func.isRequired
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        aria-labelledby={this.props.ariaLabel}>

        <Modal.Header closeButton>
        {this.props.title &&
          <Modal.Title id={this.props.ariaLabel}>
            {this.props.title}
          </Modal.Title>
        }
        </Modal.Header>
        <Modal.Body>
          {this.props.children}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Dismiss>Cancel</Modal.Dismiss>
        </Modal.Footer>
      </Modal>

    );
  }
})
