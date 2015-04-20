import {Strategy} from 'passport-local';
import User from '../models/user';
import uuid from 'uuid';
const debug = require('debug')('Passport');

export default function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new Strategy({
      // by default, local strategy uses username and password,
      // we will override with email
      usernameField: 'email',
      passwordField: 'password',
      // allows us to pass in the req from our route
      // (lets us check if a user is logged in or not)
      passReqToCallback: true
    }, (req, email, password, done) => {
      if (email) {
        // Use lower-case e-mails to avoid case-sensitive e-mail matching
        email = email.toLowerCase();
      }

      let conditions = {
        'local.email': email
      }, tokenAttempt = false;
      if (req.tokenAttempt) {
        tokenAttempt = true;
        debug('Passport knows about the token.');
        conditions.loginToken = req.query.token;
      }

      // asynchronous
      process.nextTick(() => {
        if (tokenAttempt) {

          // Create new login token after each use.
          const newToken = uuid.v4();
          User.findOneAndUpdate(
            conditions,
            {loginToken: newToken},
            (err, user) => {
            // if there are any errors, return the error
            debug('TOKEN LOGIN', err, user);
            if (err) {
              return done(err);
            }
            // if no user is found, return the message
            if (!user) {
              return done(
                null, false, req.flash('loginMessage', 'No user found.')
              );
            }


            return done(null, user);

          });

        } else {
          User.findOne(conditions, (err, user) => {
            // if there are any errors, return the error
            if (err) {
              return done(err);
            }
            // if no user is found, return the message
            if (!user) {
              return done(
                null, false, req.flash('loginMessage', 'No user found.')
              );
            }

            if (!user.validPassword(password)) {
              return done(
                null, false, req.flash('loginMessage', 'Oops! Wrong password.')
              );
            } else {

              return done(null, user);
            }
          });
        }
      });

    }));

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new Strategy({
      // by default, local strategy uses username and password,
      // we will override with email
      usernameField: 'email',
      passwordField: 'password',
      // allows us to pass in the req from our route
      // (lets us check if a user is logged in or not)
      passReqToCallback: true
    }, (req, email, password, done) => {
      debug('LOCAL SIGNUP');
      if (email) {

        // Use lower-case e-mails to avoid case-sensitive e-mail matching
        email = email.toLowerCase();
      }

      // asynchronous
      process.nextTick(() => {
        // if the user is not already logged in:
        if (!req.user) {
          User.findOne({
            'local.email': email
          }, (err, user) => {

            // if there are any errors, return the error
            if (err) {
              return done(err);
            }

            // check to see if theres already a user with that email
            if (user) {
              return done(
                null, false,
                req.flash('signupMessage', 'That email is already taken.'));
            } else {

              // create the user
              var newUser = new User();

              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.loginToken = newUser.generateToken();
              newUser.userLevel = req.body.userLevel;

              newUser.save((err) => {
                if (err) {
                  return done(err);
                }
                return done(null, newUser);
              });
            }

          });
          // if the user is logged in but has no local account...
        } else if (!req.user.local.email) {
          // ...presumably they're trying to connect a local account
          // BUT let's check if the email used to connect a local account is
          // being used by another user
          User.findOne({
            'local.email': email
          }, (err, user) => {
            if (err)
              return done(err);

            if (user) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'That email is already taken.'));
              // Using 'loginMessage instead of
              // signupMessage because it's used by /connect/local'
            } else {
              var user = req.user;
              user.local.email = email;
              user.local.password = user.generateHash(password);
              user.save((err) => {
                if (err) {
                  return done(err);
                }
                return done(null, user);
              });
            }
          });
        } else {
          // user is logged in and already has a local account.
          // Ignore signup.
          return done(null, req.user);
        }
      });
    })
  );
}
