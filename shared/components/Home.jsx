'use strict';
import React, {Component, PropTypes as pt} from 'react';
import DocumentTitle from 'react-document-title';
const debug = require('debug')('Component:Home');
debug();


export default class Home extends Component {
  static displayName = 'Home'

  static propTypes = {
    email: pt.string,
    userLevel: pt.number,
    loggedIn: pt.bool
  }

  render() {
    return (
      <DocumentTitle title="Home | Isomorphic auth app">
        <div className="hello">
          <h1>Hello,&nbsp;{this.props.email || 'Stranger'}</h1>
          <p>Welcome to the site!</p>
          {this.props.loggedIn &&
            <h2>Your user level is {this.props.userLevel}</h2>
          }
        </div>
      </DocumentTitle>
    );
  }
}
