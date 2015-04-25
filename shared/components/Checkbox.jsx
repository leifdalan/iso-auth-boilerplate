'use strict';
import React from 'react';

export default React.createClass({
  displayName: 'CheckBox',

  render() {
    let input;
    if (this.props.label) {
      input = (
        <label htmlFor={`checkbox-${this.props.inputKey}`}>
          <input
            id={`checkbox-${this.props.inputKey}`}
            checked="false"
            {...this.props}
            onChange={this.props.onChangeCallback}
            type="checkbox"
          />
          {this.props.label}
        </label>
      );
    } else {
      input =
        <input
          id={this.props.inputKey}
          checked={this.props.value}
          {...this.props}
          onChange={this.props.onChangeCallback}
          type="checkbox"
        />;
    }
    return input;
  }
})
