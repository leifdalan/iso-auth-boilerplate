'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import PageStore from '../stores/PageStore';
const debug = require('debug')('Component:WildCard');
debug();

class WildCard extends Component {

  constructor(props) {
    super(props);
    debug(props);
    this.state = props.store.singlePage;
  }

  static displayName = 'WildCard'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const newState = nextProps.store;
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <h1>{this.state.title}</h1>
        <div dangerouslySetInnerHTML={{__html: this.state.content || 'Not found!!'}} />
      </div>
    );
  }
}

WildCard = connectToStores(WildCard, [PageStore], (stores) => {
  return {
    store: stores.PageStore.getState()
  };
});

export default WildCard;
