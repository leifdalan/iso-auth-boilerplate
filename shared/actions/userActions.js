import request from 'superagent';
const debug = require('debug')('Action:userActions');

export const editUserAction = ({dispatch}, payload, done) => {
  request
    .put(`/admin/users/${payload._id}`)
    .send(payload)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      const {success, user, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          dispatch('adminUserEdit_PAYLOAD', user);
          dispatch('FLASH_MESSAGE', success);
        } else if (error) {
          dispatch('adminUserEdit_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
export const searchUserAction = ({dispatch}, payload, done) => {
  request
    .get(`?s=${payload}`)
    .send(payload)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      const {success, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          dispatch('adminUsersPaginated_PAYLOAD', res.body);
        } else if (error) {
          dispatch('adminUserEdit_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
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
    .end((xhrError, res) => {
      debug('Response:');
      debug(res);
      const {success, user, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          debug('Deleting: ', success, user);
          dispatch('REDIRECT', {
            url: `/admin/users/page/20/1`,
            flashMessage: success
          });
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
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
    return done();
  }
  dispatch('REQUEST_START');
  request
    .post('/admin/users')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send(payload)
    .end((xhrError, res) => {
      dispatch('REQUEST_END');
      debug('Response:');
      debug(res);
      const {success, user, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(res);
        dispatch('FLASH_MESSAGE', error);
        // if (error && error.errorFor) {
        //   dispatch('ERROR_FIELDS', error.errorFor);
        // }
      } else {
        if (success) {
          debug('Created: ', success, user);
          dispatch('REDIRECT', {
            url: `/admin/users/${user._id}`,
            flashMessage: success
          });
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
