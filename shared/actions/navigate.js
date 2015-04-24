'use strict';
import request from 'superagent';
import RSVP from 'rsvp';
const debug = require('debug')('Action:navigate');

export default function ({dispatch}, payload, done) {
  debug('Navigation Payload vvvvv');
  debug(payload);

  new RSVP.Promise((resolve, reject) => {
    if (payload.preRender) {
      debug('PreRender data exists, attaching...');
      resolve(payload.preRender);
    } else {
      dispatch('REQUEST_START');
      request
        .get(payload.path)
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .end(function(xhrError, res) {
          const {error} = res;
          if (xhrError || res.badRequest) {
            debug(xhrError || res.badRequest);
            reject(xhrError || res.badRequest);
          } else {
            if (error) {
              debug('Navigation error');
              debug(error);
              reject(error);
            } else {
              debug('Navigation response:');
              debug(res);
              resolve(res);
            }
          }
      });
    }
  }).then((resolution) => {
    dispatch('CHANGE_ROUTE', payload);
    const activeRouteName = payload.routes[payload.routes.length - 1].name;
    debug(activeRouteName);
    // Create dynamic action based on path, dispatch with data.
    const dataAction = `${activeRouteName}_PAYLOAD`;
    dispatch(dataAction, resolution.body || resolution);

    // dispatch('LOAD_PAGE', payload);
    if (resolution.flashMessage) {
      dispatch('FLASH_MESSAGE', resolution.flashMessage);
    }
    if (resolution.reqAttempt) {
      dispatch('SAVE_REQUEST_ATTEMPT', resolution.reqAttempt);
    }
    done();
  }).catch((err) => {
    debug('Navigation error promise catch', err);
    dispatch('NAVIGATION_ERROR',
      `Oops, having problems navigating to ${payload.path}`
    );
  });
}
