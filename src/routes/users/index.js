import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';

import Dashboard from '../admin/dashboard';
import withAdminLayout from '../../layout/withAdminLayout';
import { Unauthorized } from '../../components/utilities/protectedRoute';
import ViewUser from '../../container/dashboard/ViewUser';

const Calendars = lazy(() => import('../../container/Calendar'));
const Inbox = lazy(() => import('../../container/email/Email'));
const Chat = lazy(() => import('../../container/chat/ChatApp'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const ToDo = lazy(() => import('../../container/toDo/ToDo'));
const Note = lazy(() => import('../../container/note/Note'));
const Contact = lazy(() => import('../../container/contact/Contact'));
const ContactGrid = lazy(() => import('../../container/contact/ContactGrid'));
const ContactAddNew = lazy(() => import('../../container/contact/AddNew'));
// const FileManager = lazy(() => import('../../container/fileManager/FileManager'));
const Kanban = lazy(() => import('../../container/kanban/Index'));
const Task = lazy(() => import('../../container/task/Index'));

const Meals = lazy(() => import('../../container/dashboard/Meals'));
const CreateMeal = lazy(() => import('../../container/dashboard/CreateMeal'));
const AllMealStats = lazy(() => import('../../container/dashboard/AllMealStats'));
const WorkoutStats = lazy(() => import('../../container/dashboard/WorkoutStats'));
const Dishes = lazy(() => import('../../container/dashboard/Dishes'));
const Workouts = lazy(() => import('../../container/dashboard/Workouts'));
const CreateWorkout = lazy(() => import('../../container/dashboard/CreateWorkout'));
const AllWorkouts = lazy(() => import('../../container/dashboard/AllWorkouts'));
const CreateExsercise = lazy(() => import('../../container/dashboard/CreateExsercise'));
const Progress = lazy(() => import('../../container/dashboard/Progress'));
const Users = lazy(() => import('../../container/dashboard/Users'));
const InboxC = lazy(() => import('../../container/dashboard/Inbox'));
const WorkoutMealProgress = lazy(() => import('../../container/dashboard/WorkoutMealProgress'));
const MyUsers = lazy(() => import('../../container/dashboard/MyUsers'));
const MyProfile = lazy(() => import('../../container/dashboard/MyProfile'));

function UsersAccess() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        <Route exact path={`${path}/my-users`} component={MyUsers} />
        <Route path={`${path}/calendar`} component={Calendars} />
        <Route path={`${path}/app/kanban`} component={Kanban} />
        <Route path={`${path}/email/:page`} component={Inbox} />
        <Route path={`${path}/main/chat`} component={Chat} />
        <Route path={`${path}/profile/myProfile`} component={Myprofile} />
        <Route path={`${path}/app/to-do`} component={ToDo} />
        <Route path={`${path}/app/note`} component={Note} />
        <Route path={`${path}/app/task`} component={Task} />
        <Route exact path={`${path}/users-meals`} component={Meals} />
        <Route exact path={`${path}/create-meal`} component={CreateMeal} />
        <Route exact path={`${path}/meals-log`} component={AllMealStats} />
        <Route exact path={`${path}/dishes`} component={Dishes} />
        <Route exact path={`${path}/workout-log`} component={WorkoutStats} />
        <Route exact path={`${path}/users-workouts`} component={Workouts} />
        <Route exact path={`${path}/create-workout`} component={CreateWorkout} />
        <Route exact path={`${path}/create-workout/exercise`} component={CreateExsercise} />
        <Route exact path={`${path}/workouts`} component={AllWorkouts} />
        <Route exact path={`${path}/progress`} component={Progress} />
        <Route exact path={`${path}/users/:id`} component={ViewUser} />
        <Route exact path={`${path}/my-chats`} component={InboxC} />
        <Route exact path={`${path}/progress/workout-and-meals/:userId`} component={WorkoutMealProgress} />
        <Route exact path={`${path}/my-profile`} component={MyProfile} />

        <Route exact path={path} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route path={`${path}/social`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/eco`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/business`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/performance`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/crm`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/sales`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/dietitians`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/add-dietitian`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/all-users`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/progress/workout-and-meals/:userId`} component={WorkoutMealProgress} />
        <Route exact path={`${path}/app-banners`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/app-banners/upload`} render={() => <Redirect to={`${path}/my-users`} />} />
        <Route exact path={`${path}/unauthorized`} component={Unauthorized} />
      </Suspense>
    </Switch>
  );
}

export default withAdminLayout(UsersAccess);
