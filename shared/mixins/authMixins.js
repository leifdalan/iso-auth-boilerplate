'use strict';
import ApplicationStore from '../stores/ApplicationStore';
import debug from 'debug';
debug('Mixin:CheckAuthMixin');

export const CheckAdminMixin = {
  statics: {
    willTransitionTo(transition) {
      const {loggedIn, userLevel} =
        transition
          .context
          .getActionContext()
          .getStore(ApplicationStore)
          .getState();

      const isLoggedIn = transition.context.user || loggedIn;
      if (!isLoggedIn) {
        debug('Redirecting from about to "/signin"...');
        transition.redirect('/signin', { reason: 'UNAUTHENTICATED' });
      } else {
        const isAuthorized = userLevel > 1 ||
          transition.context.user.userLevel > 1;
        if (!isAuthorized) {
          debug('Redirecting from about to "/"...');
          transition.redirect('/', { reason: 'UNAUTHORIZED' });
        }
      }
    }
  }
};

export const CheckLoginMixin = {
  statics: {
    willTransitionTo(transition) {
      const {loggedIn} =
        transition
          .context
          .getActionContext()
          .getStore(ApplicationStore)
          .getState();

      const isLoggedIn = transition.context.user || loggedIn;
      if (!isLoggedIn) {
        debug('Redirecting from about to "/signin"...');
        transition.redirect('/signin', { reason: 'UNAUTHENTICATED' });
      }
    }
  }
};
