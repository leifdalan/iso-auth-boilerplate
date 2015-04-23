import React from 'react';
import {Route, DefaultRoute, NotFoundRoute, Redirect} from 'react-router';
import Application from './Application';
import About from './About';
import Home from './Home';
import Page from './Page';
import Dashboard from './Dashboard';
import SignIn from './SignIn';
import AdminIndex from './Admin';
import Users from './Admin/Users';
import User from './Admin/User';
import NotFound from './NotFound';
import CreateUser from './Admin/CreateUser';

export default (
  <Route name="app" path="/" handler={Application}>
    <Route name="about" static="true" handler={About}/>
    <Route name="page" path="/page/:id" handler={Page}/>
    <Route name="dashboard" path="/dashboard" handler={Dashboard}/>
    <Route name="signin" path="/signin" handler={SignIn}/>
    <Route name="admin" path="/admin">
      <Redirect
        from="/admin/users"
        to="adminUsersPaginated"
        params={{perpage: 20, pagenumber: 1}}
      />

    <Route name="createUser" path="/admin/users/create" handler={CreateUser} />

      <Route
        name="adminUsersPaginated"
        path="/admin/users/page/:perpage/:pagenumber"
        handler={Users}
      />
      <Route name="adminUserEdit" path="/admin/users/:id" handler={User} />
      <DefaultRoute name="adminDashboard" handler={AdminIndex}/>
    </Route>

    <DefaultRoute name="home" handler={Home}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);
