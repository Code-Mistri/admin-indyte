import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Form, Input, Button, Modal, Card, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Auth0Lock } from 'auth0-lock';

import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { auth0options } from '../../../../config/auth0';
import { AuthApiService, USER_ROLES, formatErrorMessage } from '../../../../services/authApiService';

const { Text } = Typography;

// Constants
const ROUTES = {
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/my-users',
  FORGOT_PASSWORD: '/forgotPassword',
};

// Environment variables
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

// Custom hook for login state management
const useLoginState = () => {
  const [loginState, setLoginState] = useState({
    adminLoginPending: false,
    dietitianLoginPending: false,
    keepLoggedIn: false,
    error: null,
  });

  const updateLoginState = (updates) => {
    setLoginState((prev) => ({ ...prev, ...updates }));
  };

  const setUserLoginPending = (userRole, pending) => {
    const key = userRole === USER_ROLES.ADMIN ? 'adminLoginPending' : 'dietitianLoginPending';
    updateLoginState({ [key]: pending });
  };

  const clearError = () => {
    updateLoginState({ error: null });
  };

  const setError = (error) => {
    updateLoginState({ error: formatErrorMessage(error) });
  };

  return {
    loginState,
    updateLoginState,
    setUserLoginPending,
    clearError,
    setError,
  };
};

function SignIn() {
  const history = useHistory();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const [form] = Form.useForm();
  const { loginState, updateLoginState, setUserLoginPending, clearError, setError } = useLoginState();
  const [role, setRole] = useState(null);

  // Initialize Auth0 Lock
  const lock = new Auth0Lock(clientId, domain, auth0options);

  //  subdomain-based role detection
  useEffect(() => {
    const host = window.location.hostname;
    const sub = host.split('.')[0];


    if (sub === 'admin') {
      setRole(USER_ROLES.ADMIN);
    } else if (sub === 'dietician' || sub === 'dietitian') {
      setRole(USER_ROLES.DIETITIAN);
    } else {
      setRole(USER_ROLES.DIETITIAN); // default fallback
    }
  }, []);

  // Form validation rules
  const emailRules = [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' },
  ];

  const passwordRules = [
    { required: true, message: 'Password is required' },
    { min: 6, message: 'Password must be at least 6 characters long' },
  ];

  // Navigation handlers
  const navigateAfterLogin = useCallback(
    (userRole) => {
      if (userRole === USER_ROLES.ADMIN) {
        history.push(ROUTES.ADMIN);
      } else {
        history.push(ROUTES.ADMIN_USERS);
      }
    },
    [history],
  );

  // Main login handler

  const handleSubmit = useCallback(
    async (userRole) => {

      // Validate user role
      if (!Object.values(USER_ROLES).includes(userRole)) {
        console.error(' Invalid role passed:', userRole);

        setError('Invalid user role specified');
        return;
      }

      // Validate form first using API service
      try {
        const { email, password } = form.getFieldsValue();

        // Validate inputs using API service validators
        const emailValidation = AuthApiService.validateEmail(email);
        if (!emailValidation.isValid) {
          setError(emailValidation.message);
          return;
        }

        const passwordValidation = AuthApiService.validatePassword(password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.message);
          return;
        }

        setUserLoginPending(userRole, true);
        clearError();

        // Use Redux action which now uses the common API service
        const loginResponse = await dispatch(
          login({
            email: email.trim(),
            password,
            user: userRole,
          }),
        );

        console.log('Login response:', loginResponse);

        // Handle login errors
        if (loginResponse?.err) {
          let errorMessage = 'Login failed. Please try again.';

          // Extract error message from response
          if (loginResponse?.err?.err?.errors?.general) {
            errorMessage = loginResponse?.err?.err.errors.general;
          } else if (loginResponse?.err?.err?.errors?.password) {
            errorMessage = formatErrorMessage(loginResponse?.err?.err.errors.password);
          } else if (loginResponse?.err?.err?.errors?.email) {
            errorMessage = formatErrorMessage(loginResponse?.err?.err.errors.email);
          } else if (loginResponse?.err?.err?.message) {
            errorMessage = loginResponse?.err?.err.message;
          }

          setError(errorMessage);
          return;
        }

        // Handle successful login
        if (loginResponse?.type === 'LOGIN_SUCCESS') {
          message.success(`Successfully signed in as ${userRole}`);
          navigateAfterLogin(userRole);
        } else {
          setError('Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Network error. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setUserLoginPending(userRole, false);
      }
    },
    [form, dispatch, setUserLoginPending, clearError, setError, navigateAfterLogin],
  );

  // Auth0 event handler
  useEffect(() => {
    const handleAuth0Authentication = (authResult) => {
      lock.getUserInfo(authResult.accessToken, (error) => {
        if (error) {
          console.error('Auth0 error:', error);
          setError('Authentication failed');
          return;
        }

        // Handle Auth0 login success
        message.success('Authentication successful');
        lock.hide();
      });
    };

    lock.on('authenticated', handleAuth0Authentication);

    // Cleanup
    return () => {
      lock.removeAllListeners('authenticated');
    };
  }, [lock, setError]);

  // Checkbox change handler
  const handleKeepLoggedInChange = (checked) => {
    updateLoginState({ keepLoggedIn: checked });
  };

  // Get loading state for specific user role
  const isUserRoleLoading = (userRole) => {
    return userRole === USER_ROLES.ADMIN ? loginState.adminLoginPending : loginState.dietitianLoginPending;
  };

  return (
    <>
      {/* Error Modal */}
      <Modal
        open={!!loginState.error}
        onOk={clearError}
        onCancel={clearError}
        title="Sign In Error"
        centered
        footer={[
          <Button key="ok" type="primary" onClick={clearError}>
            OK
          </Button>,
        ]}
      >
        <Card>
          <Text type="danger">{loginState.error}</Text>
        </Card>
      </Modal>

      <AuthWrapper>
        <div className="auth-contents">
          <Form name="login" form={form} layout="vertical" autoComplete="off">
            <Heading as="h3">
              Sign in to <span className="color-secondary">{role === USER_ROLES.ADMIN ? 'Admin' : 'Dietitian'}</span>{' '}
            </Heading>

            <Form.Item name="email" label="Email Address" rules={emailRules}>
              <Input placeholder="Enter your email address" autoComplete="email" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={passwordRules}>
              <Input.Password placeholder="Enter your password" autoComplete="current-password" />
            </Form.Item>

            <div className="auth-form-action">
              <Checkbox onChange={handleKeepLoggedInChange} checked={loginState.keepLoggedIn}>
                Keep me logged in
              </Checkbox>
              <NavLink className="forgot-pass-link" to={ROUTES.FORGOT_PASSWORD}>
                Forgot password?
              </NavLink>
            </div>

            <Form.Item>
              <div className="flex justify-center gap-less">
                <Button
                  className="btn-signin"
                  onClick={() => handleSubmit(role)}
                  type="primary"
                  shape="round"
                  size="large"
                  loading={isUserRoleLoading(USER_ROLES.ADMIN)}
                  disabled={isLoading || loginState.dietitianLoginPending}
                >
                  {role === USER_ROLES.ADMIN ? 'Sign In as Admin' : 'Sign In as Dietitian'}
                </Button>

                {/* <Button
                  className="btn-signin"
                  onClick={() => handleSubmit(USER_ROLES.DIETITIAN)}
                  type="primary"
                  shape="round"
                  size="large"
                  loading={isUserRoleLoading(USER_ROLES.DIETITIAN)}
                  disabled={isLoading || loginState.adminLoginPending}
                >
                  Sign In as Dietitian
                </Button> */}
              </div>
            </Form.Item>
          </Form>
        </div>
      </AuthWrapper>
    </>
  );
}

export default SignIn;
