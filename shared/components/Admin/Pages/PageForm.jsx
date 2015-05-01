'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../../../utils';
import {merge} from 'lodash';
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
    this.state.content = this.state.content || '';
  }

  static displayName = 'PageForm'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  handleSubmit(e) {
    e.preventDefault();
    const content = findDOMNode(this.refs.content).innerHTML,
      lastUpdated = new Date();
    this.setState({
      content,
      lastUpdated
    });

    // setState is not gauranteed to be synchronous
    const formValues = merge(this.state, {
      content,
      lastUpdated
    });
    this.props.handleSubmit(formValues);
  }

  handleChange(field, e) {
    this.setState({
      [field]: e.target.value
    });
  }

  componentDidMount() {
    if (window && window.document) {
      const MediumEditor = require('medium-editor-webpack');
      this.mediumEditor = new MediumEditor(findDOMNode(this.refs.content));
    }

  }

  componentWillUnmount() {
    this.mediumEditor.destroy();
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
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            id="slug"
            name="slug"
            key="slug"
            onChange={this.handleChange.bind(null, 'slug')}
            value={this.state.slug}
            />
          <label htmlFor="content">content</label>
          <div
            id="content"
            name="content"
            key="content"
            ref="content"
            dangerouslySetInnerHTML={{__html: this.state.content}}
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
