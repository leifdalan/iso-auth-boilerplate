  import request from 'superagent';
const debug = require('debug')('Action:userActions');

export const editUserAction = ({dispatch}, payload, done) => {
  request
    .put(`/admin/users/${payload._id}`)
    .send(payload)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((err, {body}) => {
      const {success, user, error} = body;
      debug('RESPONSE?!');
      debug(err);
      // debug(success, user);
      if (success) {
        dispatch('adminUserEdit_PAYLOAD', user);
        dispatch('FLASH_MESSAGE', success.message);
      } else if (error) {
        dispatch('adminUserEdit_FAILURE', error.message);
        dispatch('FLASH_MESSAGE', error.message);
      }
      done && done();
    }
  );
};

export const deleteUserAction = ({dispatch}, payload, done) => {
  debug('Logging out.');
  request
    .del(`/admin/users/${payload._id}`)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((err, {body}) => {
      const {success, user, message} = body;
      if (err) {
        dispatch('FLASH_MESSAGE', err);
      } else {
        debug('Deleting: ', success, user, message);
        dispatch('REDIRECT', {
          url: `/admin/users/page/20/1`,
          flashMessage: success.message
        });
      }
      done && done();
    }
  );
};

export const createUserAction = ({dispatch}, payload, done) => {
  debug('createUser');
  if (payload.local && payload.local.email && payload.local.password) {
    payload.email = payload.local.email;
    payload.password = payload.local.password;
  } else {
    dispatch('FLASH_MESSAGE', 'Need email and password fields.');
    done();
  }
  request
    .post('/admin/users')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send(payload)
    .end((err, {body}) => {
      const {success, user, message} = body;
      if (err || body.errors) {
        dispatch('FLASH_MESSAGE', body.message);
      } else {

        debug('Creating', success, user, message);
        dispatch('REDIRECT', {
          url: `/admin/users/${user._id}`,
          flashMessage: message
        });
      }
      done && done();
    }
  );
};
