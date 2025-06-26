import React, { useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { Form, Input, Button, Checkbox, Modal, Card, Typography } from 'antd';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { API_ENDPOINT } from '../../../../utils/endpoints';

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [error, setError] = useState(false);
  const [sucess, setSuccess] = useState(false);
  const [OTPucess, setOTPSuccess] = useState(false);
  const [checked, setChecked] = useState(false);
  const requestOtp = async () => {
    setOTPLoading(true);
    if (!phone) {
      setError('Please enter phone number');
    }
    try {
      const res = await axios.post(`${API_ENDPOINT}/${checked ? 'admin' : 'user'}/requestOtp`, {
        phone,
      });
      if (res.status === 200) {
        setOTPSuccess(true);
      } else {
        throw new Error('Could not send OTP');
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setOTPLoading(false);
    }
  };
  const handleSubmit = async () => {
    setLoading(true);

    if (!newPass || !otp) {
      setError('Please enter the new password and OTP');
    }
    try {
      const res = await axios.post(`${API_ENDPOINT}/${checked ? 'admin' : 'user'}/resetPassword`, {
        phone,
        otp,
        password: newPass,
      });
      if (res.status === 200) {
        setSuccess(true);
      } else {
        throw new Error('Could not send OTP');
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      {sucess && (
        <Modal open={sucess} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}>Password Reset Successfull</Typography>
          </Card>
        </Modal>
      )}
      <AuthWrapper>
        <div className="auth-contents">
          <Form name="forgotPass" layout="vertical">
            <Heading as="h3">Forgot Password?</Heading>
            <p className="forgot-text">Enter the your phone number and we’ll send you ant OTP.</p>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: 'Inavlid Phone', type: 'string', max: 13, min: 10 }]}
            >
              <Input placeholder="+910006668881" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Form.Item>
            {OTPucess && (
              <>
                <Form.Item
                  label="OTP"
                  name="otp"
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter 6 didgit OTP!',
                      type: 'string',
                      min: 6,
                      max: 6,
                    },
                  ]}
                >
                  <Input placeholder="XXXXXX" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="new-password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input new Password of Min 6 char!',
                      type: 'string',
                      min: 6,
                    },
                  ]}
                >
                  <Input placeholder="new password..." value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </Form.Item>
              </>
            )}

            {!OTPucess && (
              <Form.Item>
                <Button
                  className="btn-reset"
                  onClick={async () => {
                    await requestOtp();
                  }}
                  type="primary"
                  size="large"
                >
                  {otpLoading ? 'wait...' : 'Send OTP'}
                </Button>
              </Form.Item>
            )}
            {OTPucess && (
              <Form.Item>
                <Button
                  className="btn-reset"
                  onClick={async () => {
                    await handleSubmit();
                  }}
                  type="primary"
                  size="large"
                >
                  {loading ? 'wait...' : 'Reset Password'}
                </Button>
              </Form.Item>
            )}
            <div className="auth-form-action">
              <Checkbox onChange={() => setChecked(!checked)} checked={checked}>
                I am an admin user
              </Checkbox>
            </div>
            <p className="return-text">
              Return to <NavLink to="/">Sign In</NavLink>
            </p>
          </Form>
        </div>
      </AuthWrapper>
    </>
  );
}

export default ForgotPassword;
