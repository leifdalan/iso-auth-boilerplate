const debug = require('debug')('Routes');

export default function(server, passport) {
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.abortNavigation = {
      to: '/signin',
      params: {
        reason: 'UNAUTHENTICATED'
      }
    };
    next();
  }

  function isAdmin(req, res, next) {
    if (req.user && req.user.userLevel > 1) {
      return next();
    }
    req.abortNavigation = {
      to: '/signin',
      params: {
        reason: 'UNAUTHORIZED'
      }
    };
    next();
  }

  // Abstract of sending data from the server to client,
  // whether its the first request or an in-app XHR.
  function sendData({data, req, res, next}) {
    if (req.xhr) {
      setTimeout(() => {
        res.json(data);
      }, 500);
    } else {
      req.preRender = data;
      next();
    }
  }

  // process the signup form
  server.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      debug('Logging in.');
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
  });

  server.post('/login', (req, res, next) => {
    debug(req.body);
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
          res.redirect('/dashboard');
        }
      });
    })(req, res, next);
  });

  server.get('/dashboard', isLoggedIn, (req, res, next) => {
    const data = {
      content: 'I\'m some content that\'s going to be awesome.'
    };
    sendData({data, req, res, next});
  });

  server.get('/admin-page', isLoggedIn, isAdmin, (req, res, next) => {
    const data = {
      content: 'Im an admin page, look at me go.'
    };
    sendData({data, req, res, next});
  });

  server.post('/logout', (req, res) => {
    req.logout();
    res.send('YUP, logged out, dude.');
  });
}
