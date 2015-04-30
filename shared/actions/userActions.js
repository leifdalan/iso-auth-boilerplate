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

export function updateResultsAction({dispatch}, payload, done) {
  dispatch('IN_PAGE_REQUEST_START', payload.loadingProperty);
  request
    .get(payload.url)
    .send(payload.url)
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
      dispatch('IN_PAGE_REQUEST_END', payload.loadingProperty);
      done && done();
    }
  );
}

export function editManyUsersAction(actionContext, payload, done) {
  const {dispatch} = actionContext;
  request
    .put(`/admin/users/`)
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
          updateResultsAction(actionContext, window.location.href);
          dispatch('FLASH_MESSAGE', success);
        } else if (error) {
          dispatch('adminUserEdit_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
}

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
          dispatch('FLASH_MESSAGE', success);
          payload.router.transitionTo('/admin/users/page/20/1')
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};

export const createUserAction = ({dispatch}, {formValues, router}, done) => {
  debug('createUser');
  if (formValues.local && formValues.local.email && formValues.local.password) {
    formValues.email = formValues.local.email;
    formValues.password = formValues.local.password;
  } else {
    dispatch('FLASH_MESSAGE', 'Need email and password fields.');
    return done();
  }
  dispatch('REQUEST_START');
  request
    .post('/admin/users')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send(formValues)
    .end((xhrError, res) => {
      dispatch('REQUEST_END');
      debug('Response:');
      debug(res);
      const {success, user, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(res);
        dispatch('FLASH_MESSAGE', error);
      } else {
        if (success) {
          debug('Created: ', success, user);
          dispatch('FLASH_MESSAGE', success);
          router.transitionTo(`/admin/users/${user._id}`)
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
