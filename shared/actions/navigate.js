'use strict';
import request from 'superagent';
import RSVP from 'rsvp';
const debug = require('debug')('Action:navigate');

export default function ({dispatch}, payload, done) {
  debug('Navigation Payload vvvvv');
  debug(payload);

  new RSVP.Promise((resolve, reject) => {
    if (payload.preRender) {
      debug('preRendering...');
      resolve(payload.preRender);
    } else {
      dispatch('NAVIGATION_START');
      request
        .get(payload.path)
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .end(function(err, res) {
          if (err) {
            debug(err);
            reject(err);
          }
          debug('Navigation Response--------');
          debug(res);
          resolve(res);
      });
    }
  }).then((resolution) => {
    dispatch('CHANGE_ROUTE', payload);

    // Create dynamic action based on path, dispatch with data.
    const pathWithUnderscores = payload.path.replace(/\//g, '_').toUpperCase();
    const dataAction = `${pathWithUnderscores}_PAYLOAD`;
    dispatch(dataAction, resolution.body || resolution);

    debug();
    dispatch('LOAD_PAGE', payload);
    if (resolution.flashMessage) {
      dispatch('FLASH_MESSAGE', resolution.flashMessage);
    }
    done();
  }).catch((err) => {
    dispatch('NAVIGATION_ERROR', err);
  });
}
