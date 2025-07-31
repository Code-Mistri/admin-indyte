import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Modal, Card, Typography, message } from 'antd';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { AuthApiService, USER_ROLES, formatErrorMessage } from '../../../../services/authApiService';

const { Text } = Typography;

function ForgotPassword() {
  // State management
  const [formState, setFormState] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    isAdmin: false
  });
  
  const [uiState, setUiState] = useState({
    isRequestingOtp: false,
    isResettingPassword: false,
    isOtpSent: false,
    error: null,
    isSuccessModalVisible: false
  });

  // Helper functions
  const updateFormField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const updateUiState = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  const showError = (errorMessage) => {
    updateUiState({ error: formatErrorMessage(errorMessage) });
  };

  const clearError = () => {
    updateUiState({ error: null });
  };

  const resetForm = () => {
    setFormState({
      phone: '',
      otp: '',
      newPassword: '',
      isAdmin: false
    });
    setUiState({
      isRequestingOtp: false,
      isResettingPassword: false,
      isOtpSent: false,
      error: null,
      isSuccessModalVisible: false
    });
  };

  // Get user role based on checkbox
  const getUserRole = () => {
    return formState.isAdmin ? USER_ROLES.ADMIN : USER_ROLES.DIETITIAN;
  };

  // API handlers
  const handleRequestOtp = async () => {
    // Validate phone number using API service
    const phoneValidation = AuthApiService.validatePhone(formState.phone);
    if (!phoneValidation.isValid) {
      showError(phoneValidation.message);
      return;
    }

    updateUiState({ isRequestingOtp: true });
    clearError();

    try {
      const result = await AuthApiService.requestOtp(formState.phone, getUserRole());
      
      if (result.success) {
        updateUiState({ isOtpSent: true });
        message.success('OTP sent successfully!');
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP request failed:', error);
      showError(error.message || 'Failed to send OTP');
    } finally {
      updateUiState({ isRequestingOtp: false });
    }
  };

  const handleResetPassword = async () => {
    // Validate OTP using API service
    const otpValidation = AuthApiService.validateOtp(formState.otp);
    if (!otpValidation.isValid) {
      showError(otpValidation.message);
      return;
    }

    // Validate password using API service
    const passwordValidation = AuthApiService.validatePassword(formState.newPassword);
    if (!passwordValidation.isValid) {
      showError(passwordValidation.message);
      return;
    }

    updateUiState({ isResettingPassword: true });
    clearError();

    try {
      const result = await AuthApiService.resetPassword({
        phone: formState.phone,
        otp: formState.otp,
        password: formState.newPassword,
        userRole: getUserRole()
      });

      if (result.success) {
        updateUiState({ isSuccessModalVisible: true });
        message.success('Password reset successfully!');
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      showError(error.message || 'Failed to reset password');
    } finally {
      updateUiState({ isResettingPassword: false });
    }
  };

  const handleSuccessModalClose = () => {
    updateUiState({ isSuccessModalVisible: false });
    resetForm();
  };

  // Form validation rules
  const phoneRules = [
    { required: true, message: 'Phone number is required' },
    { min: 10, max: 13, message: 'Phone number must be between 10-13 digits' },
    { 
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        const validation = AuthApiService.validatePhone(value);
        return validation.isValid ? Promise.resolve() : Promise.reject(new Error(validation.message));
      }
    }
  ];

  const otpRules = [
    { required: true, message: 'OTP is required' },
    { len: 6, message: 'OTP must be exactly 6 digits' },
    { pattern: /^\d{6}$/, message: 'OTP must contain only numbers' },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        const validation = AuthApiService.validateOtp(value);
        return validation.isValid ? Promise.resolve() : Promise.reject(new Error(validation.message));
      }
    }
  ];

  const passwordRules = [
    { required: true, message: 'New password is required' },
    { min: 6, message: 'Password must be at least 6 characters long' },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        const validation = AuthApiService.validatePassword(value);
        return validation.isValid ? Promise.resolve() : Promise.reject(new Error(validation.message));
      }
    }
  ];

  return (
    <>
      {/* Error Modal */}
      <Modal
        open={!!uiState.error}
        onOk={clearError}
        onCancel={clearError}
        title="Error"
        centered
      >
        <Card>
          <Text type="danger">{uiState.error}</Text>
        </Card>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={uiState.isSuccessModalVisible}
        onOk={handleSuccessModalClose}
        onCancel={handleSuccessModalClose}
        title="Success"
        centered
      >
        <Card>
          <Text type="success">Password reset successful!</Text>
        </Card>
      </Modal>

      <AuthWrapper>
        <div className="auth-contents">
          <Form name="forgotPassword" layout="vertical">
            <Heading as="h3">Forgot Password?</Heading>
            <p className="forgot-text">
              Enter your phone number and we&apos;ll send you an OTP.
            </p>

            <Form.Item label="Phone" name="phone" rules={phoneRules}>
              <Input
                placeholder="+910006668881"
                value={formState.phone}
                onChange={(e) => updateFormField('phone', e.target.value)}
                disabled={uiState.isOtpSent}
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={formState.isAdmin}
                onChange={(e) => updateFormField('isAdmin', e.target.checked)}
                disabled={uiState.isOtpSent}
              >
                I am an admin user
              </Checkbox>
            </Form.Item>

            {uiState.isOtpSent && (
              <>
                <Form.Item label="OTP" name="otp" rules={otpRules}>
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={formState.otp}
                    onChange={(e) => updateFormField('otp', e.target.value)}
                    maxLength={6}
                  />
                </Form.Item>

                <Form.Item label="New Password" name="newPassword" rules={passwordRules}>
                  <Input.Password
                    placeholder="Enter new password"
                    value={formState.newPassword}
                    onChange={(e) => updateFormField('newPassword', e.target.value)}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item>
              {!uiState.isOtpSent ? (
                <Button
                  className="btn-reset"
                  onClick={handleRequestOtp}
                  type="primary"
                  size="large"
                  loading={uiState.isRequestingOtp}
                  block
                >
                  Send OTP
                </Button>
              ) : (
                <Button
                  className="btn-reset"
                  onClick={handleResetPassword}
                  type="primary"
                  size="large"
                  loading={uiState.isResettingPassword}
                  block
                >
                  Reset Password
                </Button>
              )}
            </Form.Item>

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