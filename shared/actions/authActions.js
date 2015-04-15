import request from 'superagent';
const debug = require('debug')('Action:authAction');

export const loginAction = ({dispatch}, {email, password, login}, done) => {

  if (login) {
    debug('LOGGING INTO APP WITH SERVER PASSALONG');
    debug(login);
    dispatch('LOGIN', login);
  } else {
    request
      .post('/login')
      .send({email, password})
      .set('Accept', 'application/json')
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
  }
};

export const logoutAction = ({dispatch}, payload, done) => {
  debug('Logging out.');
  request
    .post('/logout')
    .set('Accept', 'application/json')
    .end((err, res) => {
      debug('Response:', res);
      dispatch('LOGOUT');
      dispatch('REDIRECT', {url: '/page/farts'});
      done && done();
    }
  );
};

export const signUpAction = (context, {email, password, userLevel}, done) => {
  debug('SignUpAction');
  request
    .post('/signup')
    .set('Accept', 'application/json')
    .send({email, password, userLevel})
    .end((err, {body}) => {
      debug('Response:', body);
      context.dispatch('LOGIN', body.user.local.email);
      context.dispatch('REDIRECT', {url: '/dashboard'});
      done && done();
    }
  );
};
