var Fs = require('fs');
var Path = require('path');
var Async = require('async');
var Promptly = require('promptly');
var Mongodb = require('mongodb');
var Handlebars = require('handlebars');

Async.auto({

}, function (err, results) {
  if (err) {
      console.error('Setup failed.');
      console.error(err);
      return process.exit(1);
  }

  console.log('Setup complete.');
  process.exit(0);

})
