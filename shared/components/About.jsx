'use strict';
import React from 'react';
const debug = require('debug')('Component:About');
debug();

export default class About extends React.Component {

  static displayName = 'About'

  render() {
    return (
      <p>This is a description of the site.</p>
    );
  }
}
