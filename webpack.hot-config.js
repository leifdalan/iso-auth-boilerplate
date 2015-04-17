var path = require('path');
var config = require('./config');
var webpack = require('webpack');
var webpackAddress =
    config.PROTOCOL +
    config.HOSTNAME +
    ':' +
    config.WEBPACK_DEV_SERVER_PORT;
var publicPath = webpackAddress + config.PUBLIC_PATH;
console.log(publicPath);
console.log(webpackAddress);
module.exports = {
  devtool: 'eval-source-map',
  cache: true,
  context: __dirname,
  entry: {
    client: [
      'webpack-dev-server/client?' + webpackAddress,
      'webpack/hot/dev-server',
      './client'
    ]
  },

  contentBase: path.join(__dirname),
  output: {
    path: path.join(__dirname, config.PUBLIC_PATH),
    filename: 'client.js',
    publicPath: publicPath + '/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules\/(?!react-router)/,
      loaders: ['react-hot-loader', 'babel-loader?stage=0']
    }]
  }
};
