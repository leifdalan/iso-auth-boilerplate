import request from 'superagent';
const debug = require('debug')('Action:authAction');

export const editUserAction = ({dispatch}, payload, done) => {
  request
    .put(`/admin/users/${payload._id}`)
    .send()
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((err, {body}) => {
      const {success, user, message} = body;
      debug('RESPONSE?!');
      debug(err);
      // debug(success, user);
      if (success) {
        dispatch('LOGIN', user);
        dispatch('REDIRECT', {url: '/dashboard'});
      } else {
        dispatch('FLASH_MESSAGE', message);
      }
      done && done();
    }
  );
};

export const deleteUserAction = ({dispatch}, payload, done) => {
  debug('Logging out.');
  request
    .post('/logout')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((err, res) => {
      debug('Response:', res);
      dispatch('LOGOUT');
      dispatch('REDIRECT', {url: '/page/farts'});
      done && done();
    }
  );
};

// export const create = ({dispatch}, payload, done) => {
//   debug('createUser');
//   request
//     .post('/signup')
//     .set('Accept', 'application/json')
//     .set('X-Requested-With', 'XMLHttpRequest')
//     .send({email, password, userLevel})
//     .end((err, {body}) => {
//       const {success, user, message} = body;
//       debug('RESPONSE?!');
//       debug(err);
//       // debug(success, user);
//       if (success) {
//         dispatch('LOGIN', user);
//         dispatch('REDIRECT', {url: '/dashboard'});
//       } else {
//         dispatch('FLASH_MESSAGE', message);
//       }
//       done && done();
//     }
//   );
// };
