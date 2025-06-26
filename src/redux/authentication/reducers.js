import Cookies from 'js-cookie';
import actions from './actions';

const { LOGIN_BEGIN, LOGIN_SUCCESS, LOGIN_ERR, LOGOUT_BEGIN, LOGOUT_SUCCESS, LOGOUT_ERR } = actions;

const initState = {
  role: Cookies.get('role'),
  login: Cookies.get('logedIn'),
  loading: false,
  name: Cookies.get('name'),
  logo: Cookies.get('logo'),
  id: Cookies.get('userid'),
  username: Cookies.get('username'),
  phone: Cookies.get('phone'),
  email: Cookies.get('email'),
  error: null,
};

/**
 *
 * @todo impure state mutation/explaination
 */
const AuthReducer = (state = initState, action) => {
  const { type, data, err } = action;
  console.log({ action, state });
  switch (type) {
    case LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        login: data?.isLoggedIn,
        role: data?.role,
        loading: false,
        name: data?.name,
        logo: data?.logo,
        id: data?.id,
        username: data?.username,
        phone: data?.phone,
        email: data?.email,
      };
    case LOGIN_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case LOGOUT_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        login: data,
        loading: false,
      };
    case LOGOUT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};
export default AuthReducer;
