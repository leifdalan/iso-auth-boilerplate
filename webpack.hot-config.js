import path from 'path';
import config from './config';
import webpack from 'webpack';

const {
  PROTOCOL,
  HOSTNAME,
  WEBPACK_DEV_SERVER_PORT,
  PUBLIC_PATH,
  BABEL_STAGE
} = config;
const webpackAddress = `${PROTOCOL}${HOSTNAME}:${WEBPACK_DEV_SERVER_PORT}`;
const publicPath = `${webpackAddress}${PUBLIC_PATH}`;

export default {
  devtool: 'eval-source-map',
  cache: true,
  context: __dirname,
  entry: {
    client: [
      `webpack-dev-server/client?${webpackAddress}`,
      'webpack/hot/dev-server',
      './client'
    ]
  },

  contentBase: path.join(__dirname),
  output: {
    path: path.join(__dirname, PUBLIC_PATH),
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
      exclude: /node_modules\/(?!react-router)(?!app)/,
      loaders: ['react-hot-loader', `babel-loader?stage=${BABEL_STAGE}`]
    }]
  }
};
