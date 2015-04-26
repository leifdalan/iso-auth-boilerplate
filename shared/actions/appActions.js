export const flashMessageAction = ({dispatch}, payload, done) => {
  dispatch('FLASH_MESSAGE', payload);
  done();
};

export const setPageUserPrefAction = ({dispatch}, payload, done) => {
  dispatch('SET_PAGE_USER_PREF', payload);
  done();
};
