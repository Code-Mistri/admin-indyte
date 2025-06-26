import React, { useState, useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Form, Input, Button, Modal, Card, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Auth0Lock } from 'auth0-lock';
import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { auth0options } from '../../../../config/auth0';
import { API_ENDPOINT } from '../../../../utils/endpoints';
import { useLoginPending } from '../../../../zustand/users-store';

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

function SignIn() {
  const [dietLoginPending, setDietLoginPending] = useState();
  const [adminLoginPending, setAdminLoginPending] = useState();
  const [userRoleClick, setUser] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const [form] = Form.useForm();
  const [state, setState] = useState({
    checked: null,
  });
  const [error, setError] = useState('');

  const lock = new Auth0Lock(clientId, domain, auth0options);

  const handleSubmit = useCallback(
    async ({ user }) => {
      if (user === 'admin') {
        setAdminLoginPending(true);
      } else if (user === 'dietitian') {
        setDietLoginPending(true);
      }
      try {
        const { password, email } = form.getFieldsValue();

        const res = await dispatch(login({ password, email, user }));
        if (res?.err) {
          const passwordErr = res.err?.errors?.password;
          const emailErr = res.err?.errors?.email;
          const serverErr = 'Something went wrong';
          if (passwordErr) {
            setError(passwordErr);
          } else if (emailErr) {
            setError(emailErr);
          } else {
            setError(serverErr);
          }
        }
        if (res.type === 'LOGIN_SUCCESS') {
          if (user === 'admin') {
            history.push('/admin');
          }
          history.push('/admin/users-meals');
        }
      } catch (err) {
        console.error({ err });
        setError(err?.message);
      } finally {
        setAdminLoginPending(false);
        setDietLoginPending(false);
      }
    },
    [history, dispatch],
  );

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  lock.on('authenticated', (authResult) => {
    lock.getUserInfo(authResult.accessToken, (error) => {
      if (error) {
        return;
      }

      handleSubmit();
      lock.hide();
    });
  });

  return (
    <>
      {error && (
        <Modal open={error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      <AuthWrapper>
        <p className="auth-notice">
          Don&rsquo;t have an account? <NavLink to="/register">Sign up now</NavLink>
        </p>
        <div className="auth-contents">
          <Form name="login" form={form} layout="vertical">
            <Heading as="h3">
              Sign in to <span className="color-secondary">Admin</span>
            </Heading>
            <Form.Item
              name="email"
              rules={[{ message: 'Please input your  Email!', required: true }]}
              // initialValue="name@example.com"
              label="Username or Email Address"
            >
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password">
              <Input.Password placeholder="Password" />
            </Form.Item>
            <div className="auth-form-action">
              <Checkbox onChange={onChange} checked={state.checked}>
                Keep me logged in
              </Checkbox>
              <NavLink className="forgot-pass-link" to="/forgotPassword">
                Forgot password?
              </NavLink>
            </div>
            <Form.Item>
              <div className="flex justify-between gap-less">
                <Button
                  className="btn-signin"
                  onClick={async () => {
                    await handleSubmit({ user: 'admin' });
                  }}
                  type="primary"
                  shape="round"
                  size="large"
                >
                  {adminLoginPending ? 'Loading...' : 'Sign In as Admin'}
                </Button>
                <Button
                  className="btn-signin"
                  onClick={async () => {
                    setDietLoginPending(true);
                    await handleSubmit({ user: 'dietitian' });
                  }}
                  type="primary"
                  shape="round"
                  size="large"
                >
                  {dietLoginPending ? 'Loading...' : 'Sign In As Dietitian'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </AuthWrapper>
    </>
  );
}

export default SignIn;
