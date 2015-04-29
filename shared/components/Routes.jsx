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
import User from './Admin/Users/User';
import NotFound from './NotFound';
import CreateUser from './Admin/Users/CreateUser';

export default (
  <Route name="app" path="/" handler={Application}>
    <DefaultRoute name="home" handler={Home}/>
    <Route name="about" handler={About}/>
    <Route name="page" path="/page/:id" handler={Page}/>
    <Route name="dashboard" handler={Dashboard}/>
    <Route name="signin" handler={SignIn}/>

    <Route name="admin">
      <DefaultRoute name="adminDashboard" handler={AdminIndex}/>
      <Route name="users">
        <Route path="create" name="createUser" handler={CreateUser} />
        <Route path=":id" name="adminUserEdit" handler={User} />

        <Route path="page/:perpage/:pagenumber"
          name="adminUsersPaginated"
          handler={Users}
          ignoreScrollBehavior
        />
        {/* Redirect users and users/page to paginated */}
        <Redirect
          from="/admin/users/?"
          to="adminUsersPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
        <Redirect
          from="/admin/users/page/?"
          to="adminUsersPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
      </Route>
    </Route>

    <NotFoundRoute handler={NotFound}/>
  </Route>
);
