/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
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
        <Link to='/dashboard'>Dashboard!!</Link>
        {!this.props.loggedIn &&
          <li>
            <Link to='/signIn'>SignIn</Link>
          </li>
        }
      </div>
    );
  }
});

export const AdminLinks = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <li
        className={this.context.router.isActive('/admin') ?
          'pure-menu-selected' : ''
        }>
        <Link to='/page/admin'>Admin Only</Link>
        <Link to='/dashboard'>Dashboard!!</Link>
      </li>
    );
  }
});
