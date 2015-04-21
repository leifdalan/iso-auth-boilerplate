import request from 'superagent';
const debug = require('debug')('Action:authAction');

export const loginAction = ({dispatch}, {email, password, user}, done) => {

  if (user) {
    debug('LOGGING INTO APP WITH SERVER PASSALONG');
    debug(user);
    dispatch('LOGIN', user);
  } else {
    request
      .post('/login')
      .send({email, password})
      .set('Accept', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
      .end((err, {body}) => {
        const {success, user, message} = body;
        debug('RESPONSE?!');
        debug(err);
        // debug(success, user);
        if (success) {
          dispatch('LOGIN', user);
          dispatch('REDIRECT', {
            url: '/dashboard',
            flashMessage: 'Welcome!'
          });
        } else {
          dispatch('FLASH_MESSAGE', message);
        }
        done && done();
      }
    );
  }
};

export const logoutAction = ({dispatch}, payload, done) => {
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

export const signUpAction = ({dispatch}, {email, password, userLevel}, done) => {
  debug('SignUpAction');
  request
    .post('/signup')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send({email, password, userLevel})
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
