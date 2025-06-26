import React, { lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch, Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import ViewUser from '../../container/dashboard/ViewUser';

const Dashboard = lazy(() => import('../../container/dashboard'));
const Ecommerce = lazy(() => import('../../container/dashboard/Ecommerce'));
const Business = lazy(() => import('../../container/dashboard/Business'));
const Performance = lazy(() => import('../../container/dashboard/Performance'));
const CRM = lazy(() => import('../../container/dashboard/CRM'));
const Sales = lazy(() => import('../../container/dashboard/Sales'));
const Meals = lazy(() => import('../../container/dashboard/Meals'));
const CreateMeal = lazy(() => import('../../container/dashboard/CreateMeal'));
const AllMealStats = lazy(() => import('../../container/dashboard/AllMealStats'));
const WorkoutStats = lazy(() => import('../../container/dashboard/WorkoutStats'));
const Dishes = lazy(() => import('../../container/dashboard/Dishes'));
const Dietitians = lazy(() => import('../../container/dashboard/Dietitians'));
const AddDietitian = lazy(() => import('../../container/dashboard/AddDietitian'));
const Workouts = lazy(() => import('../../container/dashboard/Workouts'));
const CreateWorkout = lazy(() => import('../../container/dashboard/CreateWorkout'));
const AllWorkouts = lazy(() => import('../../container/dashboard/AllWorkouts'));
const CreateExsercise = lazy(() => import('../../container/dashboard/CreateExsercise'));
const Progress = lazy(() => import('../../container/dashboard/Progress'));
const Users = lazy(() => import('../../container/dashboard/Users'));
const Inbox = lazy(() => import('../../container/dashboard/Inbox'));
const WorkoutMealProgress = lazy(() => import('../../container/dashboard/WorkoutMealProgress'));
const UploadBanner = lazy(() => import('../../container/dashboard/UploadBanner'));
const Banners = lazy(() => import('../../container/dashboard/Banners'));
const ViewDietician = lazy(() => import('../../container/dashboard/ViewDietician'));
const MyProfile = lazy(() => import('../../container/dashboard/MyProfile'));

function DashboardRoutes() {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} component={Dashboard} />
      <Route path={`${path}/social`} component={Dashboard} />
      <Route exact path={`${path}/eco`} component={Ecommerce} />
      <Route exact path={`${path}/business`} component={Business} />
      <Route exact path={`${path}/performance`} component={Performance} />
      <Route exact path={`${path}/crm`} component={CRM} />
      <Route exact path={`${path}/sales`} component={Sales} />
      <Route exact path={`${path}/users-meals`} component={Meals} />
      <Route exact path={`${path}/create-meal`} component={CreateMeal} />
      <Route exact path={`${path}/meals-log`} component={AllMealStats} />
      <Route exact path={`${path}/dishes`} component={Dishes} />
      <Route exact path={`${path}/workout-log`} component={WorkoutStats} />
      <Route exact path={`${path}/dietitians`} component={Dietitians} />
      <Route exact path={`${path}/dietitians/:id`} component={ViewDietician} />
      <Route exact path={`${path}/add-dietitian`} component={AddDietitian} />
      <Route exact path={`${path}/users-workouts`} component={Workouts} />
      <Route exact path={`${path}/create-workout`} component={CreateWorkout} />
      <Route exact path={`${path}/create-workout/exercise`} component={CreateExsercise} />
      <Route exact path={`${path}/workouts`} component={AllWorkouts} />
      <Route exact path={`${path}/progress`} component={Progress} />
      <Route exact path={`${path}/all-users`} component={Users} />
      <Route exact path={`${path}/users/:id`} component={ViewUser} />
      <Route exact path={`${path}/my-chats`} component={Inbox} />
      <Route exact path={`${path}/my-profile`} component={MyProfile} />
      <Route exact path={`${path}/progress/workout-and-meals/:userId`} component={WorkoutMealProgress} />
      <Route exact path={`${path}/app-banners`} component={Banners} />
      <Route exact path={`${path}/app-banners/upload`} component={UploadBanner} />
      <Route exact path={`${path}/my-users`} render={() => <Redirect to={`${path}/all-users`} />} />
    </Switch>
  );
}

export default DashboardRoutes;
