'use scrict';
var BABEL_STAGE = require('./config').BABEL_STAGE;

// Babel entry point
require('babel/register')({
  ignore: /node_modules\/(?!react-router)(?!app)/,
  stage: BABEL_STAGE
});

// Server code, including ES6/7 syntax
require('./babel/index');
