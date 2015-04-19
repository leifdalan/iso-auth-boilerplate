'use strict';
import React from 'react';
import {Link} from 'react-router';
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

    return (
      <div className="main-nav">
        <ul className={classes}>
          <li>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='admin'>Admin
            </Link>
          </li>
          <li>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='users'>Users
            </Link>
          </li>
          <li>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='/'>To Site
            </Link>
          </li>

        </ul>
      </div>
    );
  }
});
