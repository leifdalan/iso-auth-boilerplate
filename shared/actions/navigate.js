'use strict';
import request from 'superagent';
import RSVP from 'rsvp';
const debug = require('debug')('Action:navigate');

export default function ({dispatch}, payload, done) {
  debug(payload);
  new RSVP.Promise((resolve, reject) => {
    if (payload.preRender) {
      debug('preRendering...');
      resolve(payload.preRender);
    } else {
      dispatch('NAVIGATION_START');
      setTimeout(() => {
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
      }, 500);
    }
  }).then((resolution) => {
    dispatch('CHANGE_ROUTE');
    dispatch('NAVIGATION_END');
    if (resolution.flashMessage) {
      dispatch('FLASH_MESSAGE', resolution.flashMessage);
    }
    done();
  }).catch((err) => {
    dispatch('NAVIGATION_ERROR', err);
  });
}
