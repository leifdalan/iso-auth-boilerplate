// Webpack configuration
var path = require('path');
var webpack = require('webpack');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var CompressionPlugin = require('compression-webpack-plugin');
require('strip-loader');

module.exports = {
  // devtool: 'eval-source-map',
  cache: true,
  progress: true,
  colors: true,
  entry: {
    client: './client.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!react-router)/,
        loaders: [
          'babel-loader?stage=0',
          'strip-loader?strip[]=debug'
        ]
      }
      // {
      //   test: /\.less$/,
      //   loader: ExtractTextPlugin.extract(
      //     'style-loader',
      //     'css-loader!less-loader!autoprefixer-loader?browsers=last 5 version')
      // },
      // {
      //   test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'url?limit=10000&minetype=application/font-woff'
      // },
      // {
      //   test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'url?limit=10000&minetype=application/octet-stream'
      // },
      // {
      //   test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'file'
      // },
      // {
      //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'url?limit=10000&minetype=image/svg+xml'
      // }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Signal production mode for React JS libs.
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // Optimize
    new webpack.NormalModuleReplacementPlugin(
      /debug/, process.cwd() + '/utils/noop.js'
    ),
    new webpack.optimize.DedupePlugin()

  ]
};
