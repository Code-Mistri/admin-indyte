import actions from './actions';
import { AuthApiService } from '../../services/authApiService';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

/**
 * Login action creator
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.user - User role (admin/dietitian)
 * @returns {Function} Redux thunk function
 */
const login = ({ email, password, user }) => {
  return async (dispatch) => {
    try {
      dispatch(loginBegin());

      // Use the common API service
      const result = await AuthApiService.login({
        email,
        password,
        userRole: user,
      });

      if (result.success) {
        return dispatch(loginSuccess(result.data));
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login action error:', error);

      // Return error in the expected format for the component
      const errorResponse = {
        err: {
          errors: {
            general: error.message,
          },
          message: error.message,
        },
      };

      return dispatch(loginErr(errorResponse));
    }
  };
};

/**
 * Logout action creator
 * @returns {Function} Redux thunk function
 */
const logOut = () => {
  return async (dispatch) => {
    try {
      dispatch(logoutBegin());

      // Use the common API service
      await AuthApiService.logout();

      dispatch(logoutSuccess(null));
    } catch (error) {
      console.error('Logout action error:', error);
      dispatch(logoutErr(error));
    }
  };
};

export { login, logOut };
