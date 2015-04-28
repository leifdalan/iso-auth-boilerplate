'use strict';
import React from 'react';
const debug = require('debug')('Component:NotFound');
debug();

export default class NotFound extends React.Component {
  render() {
    return (
      <p>This page doesn't exist!</p>
    );
  }
}
