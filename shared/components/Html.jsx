'use strict';
import React from 'react';
import {PUBLIC_PATH, CSS_PATH, JS_PATH} from '../../config';

export default React.createClass({
  render() {
    const clientScript = (
      <script src={`${PUBLIC_PATH}/${JS_PATH}`} defer></script>
    );
    const clientBootstrap = (
      <script dangerouslySetInnerHTML={{__html: this.props.state}}>
      </script>
    );
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
            href={`${PUBLIC_PATH}/${CSS_PATH}`}
          />
        </head>
        <body>
          <div
            id="app"
            dangerouslySetInnerHTML={{__html: this.props.markup}}>
          </div>
        </body>
        {this.props.shouldClientRender && {clientScript}}
        {this.props.shouldClientRender && {clientBootstrap}}
      </html>
    );
  }
});
