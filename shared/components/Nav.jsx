'use strict';
import React from 'react';
import {Link} from 'react-router';
import {SharedLinks} from './NavLinks';
import classnames from 'classnames';

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      isHovering: false
    };
  },
  mouseOverLink(e) {
    e.target.classList.add('hovering');
    this.setState({
      isHovering: true
    });
  },
  mouseOut(e) {
    e.target.classList.remove('hovering');
    this.setState({
      isHovering: false
    });
  },
  render() {
    const classes = classnames({
      'is-hovered': this.state.isHovering
    });
    const loggedInLinks =
    (
      <li>
        <Link
          onMouseOver={this.mouseOverLink}
          onMouseOut={this.mouseOut}
          to='/dashboard'>Dashboard
        </Link>
      </li>
    );
    const adminLink = (
      <li>
        <Link
          onMouseOver={this.mouseOverLink}
          onMouseOut={this.mouseOut}
          to='adminPage'>Admin
        </Link>
      </li>
    );

    return (
      <div className="main-nav">
        <ul className={classes}>
          <li>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='/'>Home
            </Link>
          </li>
          <li>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='/about'>About
            </Link>
          </li>
          {!this.props.loggedIn &&
            <li>
              <Link
                onMouseOver={this.mouseOverLink}
                onMouseOut={this.mouseOut}
                to='/signIn'>SignIn
              </Link>
            </li>
          }
          {this.props.loggedIn &&
            {loggedInLinks}
          }
          {this.props.userLevel > 1 &&
            {adminLink}
          }

        </ul>
      </div>
    );
  }
});
