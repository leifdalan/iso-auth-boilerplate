'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';

const rpt = React.PropTypes;

export default React.createClass({
  displayName: 'ResultsTable',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    properties: rpt.arrayOf(rpt.object).isRequired,
    collection: rpt.arrayOf(rpt.object).isRequired,
    handleCheckAll: rpt.func.isRequired,
    handleBulkEditClick: rpt.func.isRequired,
    handleCheck: rpt.func.isRequired
  },

  mixins: [FluxibleMixin],

  render() {
    return (
      <table className="user-table">
        <thead>
          <tr>
            <td>
              <input
                ref="globalSelector"
                onChange={this.props.handleCheckAll}
                type="checkbox" />
            </td>
            {this.props.properties.map((prop, index) =>
              <td key={index}>
                {prop.label}
              </td>
            )}
            <td>
              <button onClick={this.props.handleBulkEditClick}>
                Bulk Edit
              </button>
            </td>
          </tr>
        </thead>
        <tbody>
          {this.props.collection.map(
            (item, index) =>
            <tr
              key={item._id}
              index={index}>

              <td>
                <input
                  onChange={this.props.handleCheck.bind(null, item._id)}
                  type="checkbox"
                  ref={item._id}
                  checked={item.selected}
                  />
              </td>
              {this.props.properties.map((prop, index) =>
                <td key={index}>
                  {item[prop.valueProp]}
                </td>
              )}
              <td>
                <button
                  onClick={() =>
                    this.context.router.transitionTo(
                      `${this.props.basePath}${item._id}`
                    )}>
                  Edit
                </button>
              </td>
            </tr>
            )
          }
        </tbody>
      </table>
    );
  }
})
