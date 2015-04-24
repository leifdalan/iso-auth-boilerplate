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

export function create(req, res, next) {
  debug('Creating user');
  passport.authenticate('local-signup', (error, user) => {
    let data;
    if (error) {
      data = {
        success: false,
        error: error,
        errorFor: error.errors
      }
    } else if (!user) {
      data = {
        success: false,
        error: 'User couldn\'t be created.'
      }
    } else {
      data = {
        success: `User ${user.local.email} created successfully`,
        user
      }
    }
    sendData({data, req, res, next});
  })(req, res, next);
}

export function get(req, res, next) {
  const {perpage, currentPageNumber} = req.params;
  debug(req.query.s);
  const search = req.query.s;

  let filter = {}, data;
  if (search) {
    filter = {
      'local.email': new RegExp(search, 'i')
    }
  }

  // TODO use generators + Promises for multiple async
  // http://davidwalsh.name/async-generators
    User.count(filter, (countError, totalUsers) => {
      if (countError) {
        data = {
          success: false,
          error: countError
        }
        sendData({data, req, res, next});
      } else {
        if (totalUsers < currentPageNumber * perpage) {

          var newPageNumber = Math.floor(totalUsers / Number(perpage) + 1);
          debug('adjusting...', totalUsers, Number(perpage), newPageNumber);
          var pageAdjustment = newPageNumber;
        }
        const pageNumber = newPageNumber || Number(currentPageNumber);
        User.find(filter)
          .limit(perpage)
          .skip((pageNumber - 1) * perpage)
          .exec((paginateError, users) => {

          if (paginateError) {
            data = {
              success: false,
              error: paginateError
            }

          } else {
            data = {
              success: true,
              perpage: Number(perpage),
              currentPageNumber: pageNumber,
              search: req.query.s,
              users,
              totalUsers,
              pageAdjustment
            };
          }
          sendData({data, req, res, next});
        });
      }

    });
};

export function getOne(req, res, next) {
  debug('GETTING USER');
  if (req.params.id === 'create') {
    const data = {
      success: true
    }
    sendData({data, req, res, next});
  } else {
    User.findOne({_id: req.params.id}, (error, user) => {
      let data;
      if (error) {
        data = {
          success: false,
          error
        }
        debug('USER ERROR', error);
        sendData({data, req, res, next});
      } else {
        if (!user) {
          data = {
            success: false,
            error: `No user found for ${req.params.id}`
          }
        } else {
          data = user;
          data.success = true
        }
        debug('USER DATA', data);
        sendData({data: user, req, res, next});
      }
    });
  }
}


export function update(req, res, next) {
  debug('SETTING USER');

  // Encrypt new password, if it exists in the req.body.
  if (req.body && req.body.local && req.body.local.password) {
    let tempUser = new User();
    req.body.local.password = tempUser.generateHash(req.body.local.password);
  }

  User.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {'new': true},
    (error, user) => {
      let data;
      if (error) {
        data = {
          error,
          success: false
        };
        debug('USER ERROR', error);
        sendData({data, req, res, next});
      } else {
        if (!user) {
          data = {
            success: false,
            error: `No user found for ${req.params.id}`
          };
        } else {
          data = {
            user,
            success: {
              message: `${user.local.email} saved successfully.`
            }
          };
        }
        sendData({data, req, res, next});
      }
    });
}

export function deleteUser(req, res, next) {
  debug('DELETING USER');
  User.findByIdAndRemove(req.params.id, (error, user) => {
    let data = {};
    if (error) {
      data = {
        success: false,
        error
      };
      debug('Deletion error');
    } else {
      data = {
        success: {
          message: `"${user.local.email}" deleted successfully`
        },
        user
      };
    }
    sendData({data, req, res, next});
  });
}
