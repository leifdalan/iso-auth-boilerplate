import User from '../models/user';
import {signUp, logOut, login, isAdmin, isLoggedIn} from './authentication';
import {
  redirectUser,
  getUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
  updateManyUsers} from './admin/users';
import {
  redirectPage,
  getPages,
  getOnePage,
  updatePage,
  createPage,
  deletePage,
  updateManyPages} from './admin/pages';
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

  server.get('/admin/users/', isLoggedIn, isAdmin, redirectUser);
  server.get(
    '/admin/users/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    getUsers
  );
  server.post('/admin/users/', isLoggedIn, isAdmin, createUser);
  server.put('/admin/users/', isLoggedIn, isAdmin, updateManyUsers);
  server.get('/admin/users/:id', isLoggedIn, isAdmin, getOneUser);
  server.put('/admin/users/:id', isLoggedIn, isAdmin, updateUser);
  server.delete('/admin/users/:id', isLoggedIn, isAdmin, deleteUser);

  // ----------------------------------------------------------------------------
  // Admin Pages CRUD (/admin/pages)
  // ----------------------------------------------------------------------------

  server.get('/admin/pages/', isLoggedIn, isAdmin, redirectPage);
  server.get(
    '/admin/pages/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    getPages
  );
  server.post('/admin/pages/', isLoggedIn, isAdmin, createPage);
  server.put('/admin/pages/', isLoggedIn, isAdmin, updateManyPages);
  server.get('/admin/pages/:id', isLoggedIn, isAdmin, getOnePage);
  server.put('/admin/pages/:id', isLoggedIn, isAdmin, updatePage);
  server.delete('/admin/pages/:id', isLoggedIn, isAdmin, deletePage);

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
