'use strict';
import React from 'react';
import {Link} from 'react-router';

export const SharedLinks = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <div>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/about'>About</Link>
        </li>
        {!this.props.loggedIn &&
          <li>
            <Link to='/signIn'>SignIn</Link>
          </li>
        }
      </div>
    );
  }
});

export const LoggedInLinks = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <li>

        <Link to='/dashboard'>Dashboard!!</Link>
        {this.props.userLevel > 1 &&
          <Link to='adminPage'>Admin Only</Link>
        }
      </li>
    );
  }
});
