'use strict';
import ApplicationStore from '../stores/ApplicationStore';

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
