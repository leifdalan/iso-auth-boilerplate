'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../../../utils';
const debug = require('debug')('Component:PageForm');
debug();

export default class PageForm extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleSubmit',
      'handleChange'
    ]);
    this.state = props;
  }

  static displayName = 'PageForm'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  handleSubmit(e) {
    debug();
    e.preventDefault();
    this.setState({
      lastUpdated: new Date()
    });
    debug('state', this.state);
    this.props.handleSubmit(this.state);
  }

  handleChange(field, e) {
    if (field === 'email' || field === 'password') {
      if (!this.state.local) {
        this.setState({
          local: {}
        });
      }
      this.setState({
        local: {
          email: this.state.local.email,
          password: this.state.local.password,
          [field]: e.target.value
        }
      });
    } else {
      this.setState({
        [field]: e.target.value
      });
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="title">title</label>
          <input
            type="text"
            id="title"
            name="title"
            key="title"
            onChange={this.handleChange.bind(null, 'title')}
            value={this.state.title}
            />
          <label htmlFor="content">content</label>
          <textarea
            id="content"
            name="content"
            key="content"
            onChange={this.handleChange.bind(null, 'content')}
            value={this.state.content}
            />
          <div>
            <button
              className="button-primary"
              type="submit">
              {this.state.buttonText || 'Update User'}
            </button>
          </div>
        </form>
      </div>

    );
  }
}
