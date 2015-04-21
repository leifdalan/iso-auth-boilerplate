import passport from 'passport';
import User from '../../../models/user';
import {login, isAdmin, isLogged} from '../../authentication';
import {sendData} from '../../../services';
const debug = require('debug')('Routes:AdminUserCRUD');

// ----------------------------------------------------------------------------
// Admin Users CRUD
// ----------------------------------------------------------------------------

export function redirect(req, res) {
  res.redirect('/admin/users/page/20/1');
};

// server.post('/admin/users/', isLoggedIn, isAdmin, (req, res, next) => {
//   passport.authenticate('local-signup', (err, user) => {
//     debug('Logging in.');
//     const failMessage = {
//       success: false,
//       message: 'Well, that didn\'t work.'
//     };
//     if (err) {
//       return res.status(401).json(failMessage);
//     }
//     if (!user) {
//       return res.status(401).json(failMessage);
//     }
//   })(req, res, next);
// });


export function get(req, res, next) {
  const {perpage, currentPageNumber} = req.params;
  let data = {
    perpage: Number(perpage),
    currentPageNumber: Number(currentPageNumber)
  };

  // TODO use generators + Promises for multiple async
  // http://davidwalsh.name/async-generators
  User.find({})
    .limit(perpage)
    .skip((currentPageNumber - 1) * perpage)
    .exec((err, users) => {
      User.count({}, (countError, totalUsers) => {
        data.totalUsers = totalUsers;
        if (err) {
          debug('USER ERROR', err);
          sendData({err, req, res, next});
        } else {
          data.users = users;
          // debug('USERS', users);
          sendData({data, req, res, next});
        }
      });

    });
};

export function getOne(req, res, next) {
  debug('GETTING USER');
  User.findOne({_id: req.params.id}, (err, user) => {
    if (err) {
      err.success = false;
      debug('USER ERROR', err);
      sendData({data: err, req, res, next});
    } else {
      debug('USER:', user);
      user.success = true;
      sendData({data: user, req, res, next});
    }
  });
}

export function update(req, res, next) {
  debug('SETTING USER');

  // Encrypt new password, if it exists in the req.body.
  if (req.body.local.password) {
    let tempUser = new User();
    req.body.local.password = tempUser.generateHash(req.body.local.password);
  }

  User.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {'new': true},
    (err, user) => {
      if (err) {
        const data = {
          error: err,
          success: false
        };

        debug('USER ERROR', err);
        err.success = false;
        sendData({data: data, req, res, next});
      } else {
        const data = {
          user,
          success: {
            message: 'User saved successfully.'
          }
        };

        user.success = true;
        // debug('USERS', user);
        sendData({data: data, req, res, next});
      }
    });
}
