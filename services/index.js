import User from '../models/user';
import {signUp, logOut, login, isAdmin, isLoggedIn} from './authentication';
import {redirect, get, getOne, update, create, deleteUser} from './admin/users';
import adminUserServices from './admin/users';
const debug = require('debug')('Routes');

// Abstract of sending data from the server to client,
// whether its the first request or an in-app XHR.
export function sendData({data, req, res, next}) {
  debug('Sending data:');
  const {success, error, payload} = data;
  if (req.xhr) {
    debug('Via XHR');
    if (error) {
      debug('Error sending data:', error);
      res.status(400).json(data);
    } else {
      res.status(200).json(data);
    }

  } else {
    // TODO handle bad requests on the pass-a-long
    debug('Passing data along to server render.');
    req.preRender = data;
    next();
  }
}

export default function(server) {

  // Middleware check for token logins
  server.use((req, res, next) => {
    if (req.query.token && req.query.un) {
      req.body.email = req.query.un;
      req.body.password = req.query.token;
      debug('Attempting token login.');
      req.tokenAttempt = true;
      login(req, res, next);
    } else {
      next();
    }
  });



  // ----------------------------------------------------------------------------
  // Authorization endpoints
  // ----------------------------------------------------------------------------

  server.post('/signup', signUp);
  server.post('/login', login);
  server.post('/logout', logOut);

  // ----------------------------------------------------------------------------
  // Admin Users CRUD (/admin/users)
  // ----------------------------------------------------------------------------

  server.get('/admin/users/', isLoggedIn, isAdmin, redirect);
  server.get(
    '/admin/users/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    get
  );
  server.post('/admin/users/', isLoggedIn, isAdmin, create);
  server.get('/admin/users/:id', isLoggedIn, isAdmin, getOne);
  server.put('/admin/users/:id', isLoggedIn, isAdmin, update);
  server.delete('/admin/users/:id', isLoggedIn, isAdmin, deleteUser);

  // Blacklist undefined http verbs routes
  function fourHundred(req, res) {
    res.status(400).json({
      success: false,
      error: 'Not allowed.'
    });
  }
  server.delete('*', fourHundred)
  server.put('*', fourHundred)
  server.post('*', fourHundred)

};
