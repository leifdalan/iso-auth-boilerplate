import passport from 'passport';
import {sendData} from '../services';
const debug = require('debug')('Routes:Authentication');

export function signUp(req, res, next) {
  passport.authenticate('local-signup', (err, user) => {
    debug('Attempting passport authenticate.');
    const failMessage = {
      success: false,
      message: 'Well, that didn\'t work.'
    };
    if (err) {
      return res.status(401).json(failMessage);
    }
    if (!user) {
      return res.status(401).json(failMessage);
    }
    req.logIn(user, function(loginErr) {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.xhr) {
        res.json({
          success: true,
          user
        });
      } else {
        // Support for no Javascript.
        res.redirect('/dashboard');
      }
    });
  })(req, res, next);
}

export function logOut(req, res) {
  req.logout();
  if (req.xhr) {
    res.send('YUP, logged out, dude.');
  } else {
    req.flash('flashMessage', 'Come back again soon!');
    res.redirect('/');
  }
};

export function login(req, res, next) {
  passport.authenticate('local-login', (err, user) => {
    debug('Logging in.');
    const failMessage = {
      success: false,
      message: 'Username or password incorrect.'
    };

    if (err) {
      return res.status(401).json(failMessage);
    }

    if (!user) {
      return res.status(401).json(failMessage);
    }

    req.logIn(user, function(loginErr) {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.xhr) {
        res.json({
          success: true,
          user
        });
      } else {

        if (req.tokenAttempt) {
          next();
        } else {
          req.flash('flashMessage', 'Welcome!');
          res.redirect('/dashboard');
        }
      }
    });
  })(req, res, next);
}

export function isLoggedIn(req, res, next) {
  if (req.user) {
    debug('Is authenticated.');
    next();
  } else {
    debug('Adding abort because not authenticated.');
    req.abortNavigation = {
      to: '/signin',
      params: {
        reason: 'UNAUTHENTICATED'
      }
    };
    next();
  }
}

export function isAdmin(req, res, next) {
  if (req.user && req.user.userLevel > 1) {
    debug('Is authorized.');
    next();
  } else {
    debug('Adding abort on because not authorized.');
    req.abortNavigation = {
      to: '/signin',
      params: {
        reason: 'UNAUTHORIZED'
      }
    };
    next();
  }
}
