'use strict';
import React from 'react';
import DocumentTitle from 'react-document-title';
export default React.createClass({
  getInitialState() {
    return {};
  },
  render() {
    return (
      <DocumentTitle title="Home | Isomorphic auth app">
        <p>Welcome to the site!</p>
      </DocumentTitle>
    );
  }
});
