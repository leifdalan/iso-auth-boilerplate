'use strict';
import Fluxible from 'fluxible';

const app = new Fluxible({
  component: require('./components/Routes.jsx')
});

app.registerStore(require('./stores/ApplicationStore'));
app.registerStore(require('./stores/PageStore'));

export default app;
