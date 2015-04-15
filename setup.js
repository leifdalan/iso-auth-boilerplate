'use scrict';

// Babel entry point
require('babel/register')({
  ignore: /node_modules\/(?!react-router)/,
  stage: 0
});

// Server code, including ES6/7 syntax
require('./babel-setup');
