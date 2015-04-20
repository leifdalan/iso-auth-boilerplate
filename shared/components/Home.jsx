'use strict';
import React from 'react';
import DocumentTitle from 'react-document-title';
const debug = require('debug')('Component:Home');


export default React.createClass({
  getInitialState() {
    return {};
  },

  componentDidMount() {
    debug(this.props);
  },
  render() {
    return (
      <DocumentTitle title="Home | Isomorphic auth app">
        <div className="hello">
          <p>Welcome to the site!</p>
          <h1>Hello,&nbsp;{this.props.email || 'Stranger'}</h1>
          {this.props.loggedIn &&
            <h2>Your user level is {this.props.userLevel}</h2>
          }

        </div>
      </DocumentTitle>
    );
  }
});
