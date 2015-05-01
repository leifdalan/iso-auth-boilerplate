import React from 'react';
import {Route, DefaultRoute, NotFoundRoute, Redirect} from 'react-router';
import Application from './Application';
import About from './About';
import Home from './Home';
import WildCard from './WildCard';
import Dashboard from './Dashboard';
import SignIn from './SignIn';
import AdminIndex from './Admin';
import Users from './Admin/Users';
import User from './Admin/Users/User';
import CreateUser from './Admin/Users/CreateUser';
import Pages from './Admin/Pages';
import Page from './Admin/Pages/Page';
import CreatePage from './Admin/Pages/CreatePage';
import NotFound from './NotFound';


export default (
  <Route name="app" path="/" handler={Application}>
    <Route name="home" path="/" handler={Home}/>
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


      <Route name="pages">
        <Route path="create" name="createPage" handler={CreatePage} />
        <Route path=":id" name="adminPageEdit" handler={Page} />

        <Route path="page/:perpage/:pagenumber"
          name="adminPagesPaginated"
          handler={Pages}
          ignoreScrollBehavior
        />
      {/* Redirect pages and pages/page to paginated */}
        <Redirect
          from="/admin/pages/?"
          to="adminPagesPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
        <Redirect
          from="/admin/pages/page/?"
          to="adminPagesPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
      </Route>

    </Route>
     <Route path="*" name="wildCard" handler={WildCard} />

    <NotFoundRoute handler={NotFound}/>
  </Route>
);
