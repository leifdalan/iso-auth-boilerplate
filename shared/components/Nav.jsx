'use strict';
import React from 'react';
import {Link} from 'react-router';
import {SharedLinks, AdminLinks} from './NavLinks';

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <ul className="pure-menu pure-menu-open pure-menu-horizontal">
        <SharedLinks {...this.props} />
        {this.props.email &&
          <AdminLinks {...this.props} />
        }
      </ul>
    );
  }
});
