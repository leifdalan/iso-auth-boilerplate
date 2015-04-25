export const flashMessageAction = ({dispatch}, payload, done) => {
  dispatch('FLASH_MESSAGE', payload);
  done();
};
