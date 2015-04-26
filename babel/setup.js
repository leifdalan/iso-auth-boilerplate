#!/usr/bin/env node
import Fs from 'fs';
import Path from 'path';
import Async from 'async';
import Promptly from 'promptly';
import User from '../models/user';
import mongoose from 'mongoose';
import Handlebars from 'handlebars';
import {ProgressBar} from 'progressbar';
const debug = require('debug')('Setup:');

Async.auto({

  mongodbUrl: (done) => {

    debug(`Let\'s set up some configuration and a few users.

    `);

    const options = {
      'default': 'mongodb://localhost:27017/iso-auth-boilerplate'
    };

    Promptly.prompt(
      '\n--- MongoDB URL: ---\n' +
      '(default: mongodb://localhost:27017/iso-auth-boilerplate) ',
      options, done
    );
  },

  adminUsername: ['promptClear', (done, results) => {

    debug('Creating mongo connection.');

    mongoose.connect(results.mongodbUrl, (err) => {
      if (err) {
        debug('==========MONGO CONNECTION ERROR===========');
        done('Couldn\'t connect to mongo.');
      } else {
        debug('Connection established.');
        const options = {
          'default': 'admin'
        };
        Promptly.prompt(
          '\n--- Admin username ---\n' +
          '(default: admin) ',
          options, done
        );
      }
    });
  }],

  adminPassword: ['adminUsername', (done) => {

    const options = {
      'default': 'admin'
    };

    Promptly.prompt(
      '\n--- Admin password ---\n' +
      '(default: admin) ',
      options, done
    );
  }],

  regularUserUsername: ['adminPassword', (done) => {

    const options = {
      'default': 'foo'
    };

    Promptly.prompt(
      '\n--- Regular user username ---\n' +
      '(default: foo) ',
      options, done
    );

  }],

  regularUserPassword: ['regularUserUsername', (done) => {

    const options = {
      'default': 'bar'
    };

    Promptly.prompt(
      '\n--- Regular user password ---\n' +
      '(default: bar) ',
      options, done
    );

  }],
  createConfig: ['regularUserPassword', (done, results) => {

    const configTemplatePath = Path.resolve(
      __dirname, '../config', 'config.example'
    );
    const configPath = Path.resolve(__dirname, '../config', 'secrets.js');
    const options = { encoding: 'utf-8' };

    Fs.readFile(configTemplatePath, options,  (err, source) => {

      if (err) {
        debug('Failed to read config template.');
        return done(err);
      }

      const configTemplate = Handlebars.compile(source);
      Fs.writeFile(configPath, configTemplate(results), done);
    });

  }],

  promptClear: ['mongodbUrl', (done) => {

    const options = {
      'default': 'n'
    };

    debug('!!!======DRAGONS======!!!');
    debug('This will delete all users if you type "y".');

    Promptly.confirm(
      '\n--- Delete all users? ---\n' +
      '(default: N) ',
      options,
      done
    );
  }],

  clearUsers: ['regularUserPassword', (done, results) => {

    if (results.promptClear) {
      debug('Removing all users.');
      User.remove({}, (err) => {
        if (err) {
          debug('Error removing.');
          return done(err);
        }
        return done();
      });
    } else {
      done();
    }

  }],

  insertUsers: ['clearUsers', (done, results) => {
    Async.series([
      (seriesDone) => {
        User.findOne({
          'local.email': results.adminUsername
        }, (err, user) => {

          if (user) {
            debug(`"${results.adminUsername}" already exists.`);
            seriesDone();
          } else {
            const newUser = new User();

            newUser.local.email = results.adminUsername;
            newUser.local.password = newUser.generateHash(results.adminPassword);
            newUser.userLevel = 3;


            newUser.save((err) => {
              if (err) {
                debug('Error adding user.');
                seriesDone(err);
              }
              seriesDone();
            });
          }

        });
      },

      (seriesDone) => {
        User.findOne({
          'local.email': results.regularUserUsername
        }, (err, user) => {

          if (user) {
            debug(`"${results.regularUserUsername}" already exists.`);
            seriesDone();
          } else {
            const newUser = new User();

            newUser.local.email = results.regularUserUsername;
            newUser.local.password = newUser.generateHash(results.regularUserPassword);
            newUser.loginToken = newUser.generateToken();
            newUser.userLevel = 1;


            newUser.save((err) => {
              if (err) {
                debug('Error adding user.');
                seriesDone(err);
              }
              return seriesDone();
            });
          }

        });      }
    ], done);
  }],
  generateABunchOfUsers: ['insertUsers', (done, results) => {
    const progressBar = new ProgressBar();
    progressBar.setTotal(999);
    let tick = 0;
    function makeid() {
      var text = "";
      var possible =
        "abcdefghijklmnopqrstuvwxyz0123456789";

      var charLength = Math.floor(Math.random() * 5 + 5);
      for( var i=0; i < charLength; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }
    const users = [];
    function createUser(callback) {
      const newUser = {local: {}};

      newUser.local.email = makeid();
      newUser.local.password = 'meh.';
      newUser.loginToken = 'token';
      newUser.userLevel = Math.floor(Math.random() * 3 + 1);
      tick++;
      progressBar.step(`Adding user`)
        .setTotal(999)
        .setTick(tick);

      users.push(newUser);
      callback();
      // newUser.save((err) => {
      //   if (err) {
      //     debug('Error adding user.');
      //     callback(err);
      //   }
      //
      //   return callback();
      // });
    }
    const numOfUsers = 999;
    const asyncArray = [];
    for (var i = 0; i < 999; i++) {
      asyncArray.push(createUser);
    }
    Async.parallel(asyncArray, () => {
      debug('Inserting...', users.length);
      User.collection.insert(users, (err, docs) => {
        debug(err);
        debug(`${users.length} inserted into Users collection`);
        done();
      });

    });
  }]
}, function (err) {
  if (err) {
      debug(err);
      debug('Setup failed. See error ^^^^^^^^');
      return process.exit(1);
  }

  mongoose.disconnect();
  debug('Setup complete!');
  debug(`
    Now just run either of these:

    \u2609 \`npm run client\` (client only rendering)
    \u2609 \`npm run iso\` (client-server rendering)
    \u2609 \`npm run server-only\` (server-only, no client-render)
    \u2609 \`npm run prod\` (client-server, no debugging, optimized assets).


    Happy coding!
    \u263A \u2615 \u26F3


    `
  );
  process.exit(0);

});
