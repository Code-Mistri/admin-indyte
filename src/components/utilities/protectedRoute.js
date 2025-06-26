import React from 'react';
import propTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Typography } from 'antd';
import { decryptData } from '../../utils/helper-functions';

export const Unauthorized = () => {
  return (
    <Card className="flex-center w-full h-full">
      <Typography>You are not authorized to access this page.</Typography>
    </Card>
  );
};
function ProtectedRoute({ component, path, allowedRoles }) {
  const isLoggedIn = useSelector((state) => state.auth.login);
  const role = useSelector((state) => state.auth.role);
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });

  return isLoggedIn && allowedRoles.includes(userRole) ? (
    <Route component={component} path={path} />
  ) : (
    <Redirect to="/admin/unauthorized" component={Unauthorized} /> // Or your custom error/login page
  );
  // return isLoggedIn ? <Route component={component} path={path} /> : <Redirect to="/" />;
}

ProtectedRoute.propTypes = {
  component: propTypes.object.isRequired,
  path: propTypes.string.isRequired,
  allowedRoles: propTypes.array.isRequired,
};

export default ProtectedRoute;
