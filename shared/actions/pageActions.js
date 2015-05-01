import request from 'superagent';
const debug = require('debug')('Action:userActions');

export const editPageAction = ({dispatch}, payload, done) => {
  request
    .put(`/admin/pages/${payload._id}`)
    .send(payload)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      const {success, page, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          dispatch('adminPageEdit_PAYLOAD', page);
          dispatch('FLASH_MESSAGE', success);
        } else if (error) {
          dispatch('adminPageEdit_FAILURE', error);
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
          dispatch('adminPagesPaginated_PAYLOAD', res.body);
        } else if (error) {
          dispatch('adminPageEdit_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
      }

      dispatch('IN_PAGE_REQUEST_END', payload.loadingProperty);
      done && done();
    }
  );
}

export function editManyPagesAction(actionContext, payload, done) {
  const {dispatch} = actionContext;
  request
    .put(`/admin/pages/`)
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
          dispatch('adminPageEdit_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
}

export const deletePageAction = ({dispatch}, payload, done) => {
  debug('Logging out.');
  request
    .del(`/admin/pages/${payload._id}`)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      debug('Response:');
      debug(res);
      const {success, page, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          debug('Deleting: ', success, page);
          dispatch('FLASH_MESSAGE', success);
          payload.router.transitionTo('/admin/pages/page/20/1');
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};

export const createPageAction = ({dispatch}, {formValues, router}, done) => {
  debug('createUser');
  dispatch('REQUEST_START');
  request
    .post('/admin/pages')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send(formValues)
    .end((xhrError, res) => {
      dispatch('REQUEST_END');
      debug('Response:');
      debug(res);
      const {success, page, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(res);
        dispatch('FLASH_MESSAGE', error);
      } else {
        if (success) {
          debug('Created: ', success, page);
          dispatch('FLASH_MESSAGE', success);
          router.transitionTo(`/admin/pages/${page._id}`);
        } else {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
