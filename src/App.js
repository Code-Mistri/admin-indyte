import React, { lazy, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader/root';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { ReactReduxFirebaseProvider, isLoaded } from 'react-redux-firebase';
import { ConfigProvider, Spin } from 'antd';
import store, { rrfProps } from './redux/store';
import Admin from './routes/admin';
import UserAccess from './routes/users';
import Auth from './routes/auth';
import './static/css/style.css';
import config from './config/config';
import ProtectedRoute, { Unauthorized } from './components/utilities/protectedRoute';
import 'antd/dist/antd.less';
import { decryptData } from './utils/helper-functions';

const { theme } = config;

const ProviderConfig = () => {
  const { rtl, isLoggedIn, topMenu, darkMode, auth, role, name, logo } = useSelector((state) => {
    return {
      darkMode: state.ChangeLayoutMode.data,
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
      isLoggedIn: state.auth.login,
      auth: state.fb.auth,
      role: state.auth.role,
      name: state.auth.name,
      logo: state.auth.logo,
    };
  });
  console.log({ name, logo });
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });

  console.log({ userRole });
  console.log({ isLoggedIn, role });

  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    let unmounted = false;
    if (!unmounted) {
      setPath(window.location.pathname);
    }
    // eslint-disable-next-line no-return-assign
    return () => (unmounted = true);
  }, [setPath]);

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={{ ...theme, rtl, topMenu, darkMode }}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          {!isLoaded(auth) ? (
            <div className="spin">
              <Spin />
            </div>
          ) : (
            <Router basename={process.env.PUBLIC_URL}>
              {isLoggedIn && userRole === 'admin' && (
                <ProtectedRoute path="/admin" allowedRoles={['admin']} component={Admin} />
              )}
              {isLoggedIn && userRole === 'dietician' && (
                <ProtectedRoute path="/admin" allowedRoles={['admin', 'dietician']} component={UserAccess} />
              )}
              {isLoggedIn && (path === process.env.PUBLIC_URL || path === `${process.env.PUBLIC_URL}/`) && (
                <Redirect to="/admin/users-meals" />
              )}
              {!isLoggedIn && <Route path="/" component={Auth} />}{' '}
            </Router>
          )}
        </ReactReduxFirebaseProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ProviderConfig />
    </Provider>
  );
}

export default hot(App);
