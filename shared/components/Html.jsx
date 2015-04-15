'use strict';
import React from 'react';

/**
 * React class to handle the rendering of the HTML head section
 *
 * @class Head
 * @constructor
 */
export default React.createClass({
  render() {
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <title>{this.props.title}</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link rel="stylesheet" href="/dist/main.css" />
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
      </body>
      <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
      <script src="/dist/client.js" defer></script>
      </html>
    );
  }
});
