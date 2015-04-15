export default function(context, payload, done) {
  context.dispatch('CLEAR_REDIRECT');
  done();
}
