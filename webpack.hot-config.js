var path = require('path');
var config = require('./config');
var webpack = require('webpack');
module.exports = {
  devtool: 'eval-source-map',
  cache: true,
  context: __dirname,
  entry: {
    client: [
      'webpack-dev-server/client?' + config.webpackAddress,
      'webpack/hot/dev-server',
      './client'
    ]
  },

  contentBase: path.join(__dirname),
  output: {
    path: path.join(__dirname, config.publicPath),
    filename: 'client.js',
    publicPath: 'http://localhost:3002/dist/'
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
