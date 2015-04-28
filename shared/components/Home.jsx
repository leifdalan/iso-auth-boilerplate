'use strict';
import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';


export default class Home extends Component {
  static displayName = 'Home'

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
