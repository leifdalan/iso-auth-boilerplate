'use strict';

import React, {Component, PropTypes as pt} from 'react';
import Checkbox from '../Checkbox';
import {autoBindAll} from '../../../utils';
import {get, isObject} from 'lodash';
const debug = require('debug')('Component:ResultsTable');
debug();

export default class ResultsTable extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleEditClick'
    ]);
  }

  static displayName = 'ResultsTable'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    properties: pt.arrayOf(pt.object).isRequired,
    collection: pt.arrayOf(pt.object).isRequired,
    handleCheckAll: pt.func,
    handleBulkEditClick: pt.func,
    handleCheck: pt.func,
    basePath: pt.string,
    editable: pt.bool
  }

  handleEditClick(item, e) {
    e.stopPropagation();
    this.context.router.transitionTo(
      `${this.props.basePath}${item._id}`
    );
  }

  render() {
    return (
      <table className="user-table">
        <thead>
          <tr>
            {this.props.editable &&
              <td>
                <Checkbox onChangeCallback={this.props.handleCheckAll} />
              </td>
            }
            {this.props.properties.map((prop, index) =>
              <td key={index}>
                {prop.label}
              </td>
            )}
            {this.props.editable &&
              <td>
                <button onClick={this.props.handleBulkEditClick}>
                  Bulk Edit
                </button>
              </td>
            }
          </tr>
        </thead>
        <tbody>
          {this.props.collection.map(
            (item, index) =>
            <tr
              key={item._id}
              className={`selected-${item.selected}`}
              index={index}
              onClick={this.props.handleCheck.bind(null, item._id)}>
              {this.props.editable &&
                <td>

                  <Checkbox
                    onChangeCallback={this.props.handleCheck.bind(null, item._id)}
                    ref={item._id}
                    checked={item.selected}
                    />
                </td>
              }

              {this.props.properties.map((prop, propIndex) =>
                <td key={`value${propIndex}`}>
                  {isObject(get(item, prop.valueProp)) ?
                    get(item, prop.valueProp) :
                    `${get(item, prop.valueProp)}`
                  }
                </td>
              )}
              {this.props.editable &&
                <td>
                  <button
                    onClick={this.handleEditClick.bind(null, item)}>
                    Edit
                  </button>
                </td>
              }

            </tr>
            )
          }
        </tbody>
      </table>
    );
  }
}
