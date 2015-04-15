const debug = require('debug')('Routes');

export default function(server, passport) {
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/signin');
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
        return res.json({
          success: true,
          user
        });
      });
    })(req, res, next);
  });

  server.post('/login', (req, res, next) => {
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
        return res.json({
          success: true,
          user
        });
      });
    })(req, res, next);
  });

  server.get('/dashboard', isLoggedIn, (req, res, next) => {
    const data = {
      content: 'I\'m some content that\'s going to be awesome.'
    };
    sendData({data, req, res, next});

  });
  //
  // server.get('/about', (req, res, next) => {
  //   debug(req.body);
  //   debug(req.url);
  //   debug('XHR?', req.xhr);
  //   if (req.xhr) {
  //     setTimeout(() => {
  //       res.json({
  //         hello: 'my darling.',
  //         URL: req.url
  //       });
  //     }, 500);
  //   } else {
  //     debug('About middleware used...');
  //     req.preRender = {
  //       preRender: 'response'
  //     };
  //     next();
  //   }
  // });

  server.post('/logout', (req, res) => {
    req.logout();
    res.send('YUP, logged out, dude.');
  });
}
