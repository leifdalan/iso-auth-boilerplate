import Fluxible from 'fluxible';

const app = new Fluxible({
  component: require('./components/Routes.jsx')
});

app.registerStore(require('./stores/ApplicationStore'));
app.registerStore(require('./stores/PageStore'));
app.registerStore(require('./stores/UserStore'));

export default app;
