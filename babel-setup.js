#!/usr/bin/env node
import Fs from 'fs';
import Path from 'path';
import Async from 'async';
import Promptly from 'promptly';
import User from './models/user';
import mongoose from 'mongoose';
import Handlebars from 'handlebars';
const debug = require('debug')('Setup:');

Async.auto({

  mongodbUrl: (done) => {

    debug('Let\'s set up some configuration and a few users.');
    debug('Defaults are in (parentheses)');

    const options = {
      'default': 'mongodb://localhost:27017/iso-auth-boilerplate'
    };

    Promptly.prompt(
      '--- MongoDB URL: (mongodb://localhost:27017/iso-auth-boilerplate)',
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
          '--- Admin username (admin)',
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
      '--- Admin password (admin)',
      options, done
    );
  }],

  regularUserUsername: ['adminPassword', (done) => {

    const options = {
      'default': 'foo'
    };

    Promptly.prompt(
      '--- Regular user username (foo)',
      options, done
    );

  }],

  regularUserPassword: ['regularUserUsername', (done) => {

    const options = {
      'default': 'bar'
    };

    Promptly.prompt(
      '--- Regular user password (bar)',
      options, done
    );

  }],
  createConfig: ['regularUserPassword', (done, results) => {

    const configTemplatePath = Path.resolve(__dirname, 'config', 'config.example');
    const configPath = Path.resolve(__dirname, 'config', 'index.js');
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

    Promptly.confirm('--- Delete all users? (N)', options, done);
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
  }]
}, function (err) {
  if (err) {
      debug(err);
      debug('Setup failed. See error ^^^^^^^^');
      return process.exit(1);
  }

  mongoose.disconnect();
  debug('Setup complete!');
  debug('Now just run `npm run dev` (client only rendering) or `npm run iso`' +
        ' (client-server rendering)');
  process.exit(0);

});
