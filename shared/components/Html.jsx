'use strict';
import React, {Component, PropTypes as pt} from 'react';
import {
  PROTOCOL,
  PUBLIC_PATH,
  PUBLIC_ASSET_DOMAIN,
  CSS_PATH,
  JS_PATH} from '../../config';

const fullPublicPath = `${PROTOCOL}${PUBLIC_ASSET_DOMAIN}${PUBLIC_PATH}`;

export default class Html extends Component {

  constructor(props) {
    super(props);
  }

  static displayName = 'Html'

  static propTypes = {
    state: pt.object.isRequired,
    markup: pt.string.isRequired,
    title: pt.object,
    shouldClientRender: pt.bool
  }

  render() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{this.props.title}</title>
          <meta name="theme-color" content="#33C3F0" />
          <meta
            name="viewport"
            content="width=device-width, user-scalable=no" />
          {/* <link
            href="http://fonts.googleapis.com/css?family=Raleway"
            rel="stylesheet"
            type="text/css"
          /> */}
          <link
            rel="stylesheet"
            href={`${fullPublicPath}/${CSS_PATH}`}
          />
        </head>
        <body>
          <div
            id="app"
            dangerouslySetInnerHTML={{__html: this.props.markup}}>
          </div>
        </body>
        {this.props.shouldClientRender &&
          <script src={`${fullPublicPath}/${JS_PATH}`} defer />
        }
        {this.props.shouldClientRender &&
          <script dangerouslySetInnerHTML={{__html: this.props.state}} />
        }
      </html>
    );
  }
}
