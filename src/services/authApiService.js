import axios from 'axios';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import Cookies from 'js-cookie';
import { API_ENDPOINT } from '../utils/endpoints';
import { encryptData } from '../utils/helper-functions';

// Constants
const USER_ROLES = {
  ADMIN: 'admin',
  DIETITIAN: 'dietitian'
};

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: true,
  expires: (() => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    return expirationDate;
  })()
};

// Utility functions
const formatErrorMessage = (error) => {
  if (!error) return '';
  
  // Handle array of errors - join with comma
  if (Array.isArray(error)) {
    return error.filter(Boolean).join(', ');
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle object errors
  if (typeof error === 'object' && error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

const validateUserRole = (userRole) => {
  return Object.values(USER_ROLES).includes(userRole);
};

const getApiEndpoint = (userRole) => {
  return userRole === USER_ROLES.ADMIN ? 'admin' : 'dietician';
};

// Chat-related functions
const handleCreateChatUser = async ({ userId, username }) => {
  try {
    const user = new CometChat.User(userId);
    user.setName(username);
    console.log('Creating chat user:', user);

    const response = await CometChatUIKit.createUser(user);
    console.log('Chat user created successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to create chat user:', error);
    throw error;
  }
};

// Cookie management functions
const setCookies = (userData) => {
  const {
    accessToken,
    role,
    userId,
    name,
    logo,
    username,
    phone,
    email,
    company
  } = userData;

  try {
    const encryptedRole = encryptData({ 
      data: role, 
      key: process.env.REACT_APP_COOKIE_SECRET 
    });

    const cookiesToSet = [
      ['access_token', accessToken],
      ['logedIn', true],
      ['role', encryptedRole],
      ['userid', userId],
      ['name', name],
      ['logo', logo],
      ['username', username],
      ['phone', phone],
      ['email', email]
    ];

    // Set company cookie only if it exists
    if (company) {
      cookiesToSet.push(['company', company]);
    }

    cookiesToSet.forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        Cookies.set(key, value, COOKIE_OPTIONS);
      }
    });

    console.log('Cookies set successfully');
  } catch (error) {
    console.error('Failed to set cookies:', error);
    throw new Error('Failed to save session data');
  }
};

const clearCookies = () => {
  const cookiesToRemove = [
    'logedIn',
    'access_token',
    'role',
    'userid',
    'name',
    'logo',
    'username',
    'phone',
    'email',
    'company'
  ];

  cookiesToRemove.forEach(cookie => {
    Cookies.remove(cookie);
  });

  console.log('Cookies cleared successfully');
};

// API Service Class
class AuthApiService {
  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {string} credentials.userRole - User role (admin/dietitian)
   * @returns {Promise<Object>} Login response data
   */
  static async login({ email, password, userRole }) {
    if (!validateUserRole(userRole)) {
      throw new Error('Invalid user role specified');
    }

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const endpoint = `${API_ENDPOINT}/${getApiEndpoint(userRole)}/login`;
      
      const response = await axios.post(endpoint, {
        email: email.trim(),
        password
      });

      if (response.status === 400) {
        throw new Error('Invalid credentials');
      }

      if (response.status !== 200) {
        throw new Error('Login failed. Please try again.');
      }

      const responseData = response.data;

      if (!responseData?.access_token) {
        throw new Error('Invalid response from server');
      }
      const encryptedRole = encryptData({ 
        data: responseData.role, 
        key: process.env.REACT_APP_COOKIE_SECRET 
      });
      // Extract user data from response
      const userData = {
        accessToken: responseData.access_token,
        userRole: encryptedRole,
        userId: responseData.id,
        logo: userRole === USER_ROLES.ADMIN ? responseData.logo : responseData.profile,
        username: responseData.username,
        name: responseData.name,
        phone: responseData.phone,
        email: responseData.email,
        company: responseData.company
      };

      // Set cookies with user data
      setCookies({
        ...userData,
        role: userData.userRole
      });

      // Optionally create chat user (commented out for now)
      // await handleCreateChatUser({ 
      //   userId: userData.userId, 
      //   username: userData.name 
      // });

      return {
        success: true,
        data: {
          isLoggedIn: true,
          role: userData.userRole,
          name: userData.name,
          logo: userData.logo,
          id: userData.userId,
          username: userData.username,
          phone: userData.phone,
          email: userData.email
        }
      };

    } catch (error) {
      console.error('Login API error:', error,error.response?.data?.message);
      
      // Format error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';

      throw new Error(formatErrorMessage(errorMessage));
    }
  }

  /**
   * Request OTP for password reset
   * @param {string} phone - User phone number
   * @param {string} userRole - User role (admin/dietitian)
   * @returns {Promise<Object>} OTP request response
   */
  static async requestOtp(phone, userRole) {
    if (!validateUserRole(userRole)) {
      throw new Error('Invalid user role specified');
    }

    if (!phone) {
      throw new Error('Phone number is required');
    }

    try {
      const endpoint = `${API_ENDPOINT}/${getApiEndpoint(userRole)}/requestOtp`;
      
      const response = await axios.post(endpoint, { phone });

      if (response.status !== 200) {
        throw new Error('Failed to send OTP');
      }

      return {
        success: true,
        message: 'OTP sent successfully'
      };

    } catch (error) {
      console.error('Request OTP API error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send OTP';

      throw new Error(formatErrorMessage(errorMessage));
    }
  }

  /**
   * Reset password with OTP
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.phone - User phone number
   * @param {string} resetData.otp - OTP code
   * @param {string} resetData.password - New password
   * @param {string} resetData.userRole - User role (admin/dietitian)
   * @returns {Promise<Object>} Password reset response
   */
  static async resetPassword({ phone, otp, password, userRole }) {
    if (!validateUserRole(userRole)) {
      throw new Error('Invalid user role specified');
    }

    if (!phone || !otp || !password) {
      throw new Error('Phone number, OTP, and new password are required');
    }

    try {
      const endpoint = `${API_ENDPOINT}/${getApiEndpoint(userRole)}/resetPassword`;
      
      const response = await axios.put(endpoint, {
        phone,
        otp,
        password
      });

      if (response.status !== 200) {
        throw new Error('Failed to reset password');
      }

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      console.error('Reset password API error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to reset password';

      throw new Error(formatErrorMessage(errorMessage));
    }
  }

  /**
   * User logout
   * @returns {Promise<Object>} Logout response
   */
  static async logout() {
    try {
      // Clear all cookies
      clearCookies();

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout properly');
    }
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {Object} Validation result
   */
  static validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    if (phone.length < 10 || phone.length > 13) {
      return { 
        isValid: false, 
        message: 'Phone number must be between 10-13 digits' 
      };
    }

    // Optional: Add more specific phone validation regex
    const phoneRegex = /^[+]?[\d\s\-()]{10,13}$/;
    if (!phoneRegex.test(phone)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid phone number' 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate OTP format
   * @param {string} otp - OTP to validate
   * @returns {Object} Validation result
   */
  static validateOtp(otp) {
    if (!otp) {
      return { isValid: false, message: 'OTP is required' };
    }

    if (otp.length !== 6) {
      return { isValid: false, message: 'OTP must be exactly 6 digits' };
    }

    if (!/^\d{6}$/.test(otp)) {
      return { isValid: false, message: 'OTP must contain only numbers' };
    }

    return { isValid: true };
  }

  /**
   * Validate password format
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { 
        isValid: false, 
        message: 'Password must be at least 6 characters long' 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }
}

// Export constants and service
export {
  AuthApiService,
  USER_ROLES,
  formatErrorMessage,
  handleCreateChatUser
};