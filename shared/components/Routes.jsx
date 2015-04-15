import React from 'react';
import {Route, DefaultRoute} from 'react-router';
import Application from './Application';
import About from './About';
import Home from './Home';
import Page from './Page';
import Dashboard from './Dashboard';
import SignIn from './SignIn';
import AdminPage from './AdminPage';

export default (
  <Route name="app" path="/" handler={Application}>
    <Route name="about" static="true" handler={About}/>
    <Route name="page" path="/page/:id" handler={Page}/>
    <Route name="dashboard" path="/dashboard" handler={Dashboard}/>
    <Route name="signin" path="/signin" handler={SignIn}/>
    <Route name="adminPage" path="/admin-page" handler={AdminPage}/>
    <DefaultRoute name="home" handler={Home}/>
  </Route>
);
