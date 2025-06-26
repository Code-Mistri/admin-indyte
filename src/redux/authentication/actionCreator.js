import axios from 'axios';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import Cookies from 'js-cookie';
import actions from './actions';
import { API_ENDPOINT } from '../../utils/endpoints';
import { encryptData } from '../../utils/helper-functions';
import { useUserInfo } from '../../zustand/users-store';

const handleCreateChatUser = async ({ userId, username }) => {
  const user = new CometChat.User(userId);
  user.setName(username);
  console.log('USER:', user);

  const response = await CometChatUIKit.createUser(user);
  console.log({ response });
};
const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

const login = ({ email, password, user }) => {
  // const { setUserInfo } = useUserInfo();
  return async (dispatch) => {
    try {
      dispatch(loginBegin());
      let response;
      if (user === 'admin') {
        response = await axios.post(`${API_ENDPOINT}/admin/login`, {
          password,
          email,
        });
      } else if (user === 'dietitian') {
        response = await axios.post(`${API_ENDPOINT}/dietician/login`, {
          password,
          email,
        });
      } else {
        throw new Error('Not Allowed');
      }
      console.log({ responseLogin: response });
      if (response.data?.access_token) {
        // setUserInfo(await response.data);
        const accessToken = await response.data?.access_token;
        const userRole = await response.data?.role;
        const userId = await response.data?.id;
        const logo = user === 'admin' ? await response.data?.logo : await response.data.profile;
        const username = await response.data?.username;
        const name = await response.data?.name;
        const phone = await response.data?.phone;
        const email = await response.data?.email;
        const company = await response.data?.company;

        console.log('here', { userRole });
        const role = await encryptData({ data: userRole, key: process.env.REACT_APP_COOKIE_SECRET });
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.setDate() + 7);
        console.log('settigncoolies');

        // await handleCreateChatUser({ userId, username: name });

        if (response.status === 400) {
          throw new Error('Invalid Credentials');
        } else if (response.status !== 200) {
          throw new Error('Something went wrong');
        }
        Cookies.set('access_token', accessToken, { secure: true, sameSite: true, expires: expirationDate });

        Cookies.set('logedIn', true, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('role', role, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('userid', userId, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('name', name, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('logo', logo, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('username', username, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('phone', phone, { secure: true, sameSite: true, expires: expirationDate });
        Cookies.set('email', email, { secure: true, sameSite: true, expires: expirationDate });
        console.log('starting dispatch');

        return dispatch(
          loginSuccess({
            isLoggedIn: true,
            role,
            name,
            logo,
            id: userId,
            username,
            phone,
            email,
          }),
        );
      }
    } catch (err) {
      console.error({ errrrr: err });
      return dispatch(loginErr(err?.response ? err.response?.data : err));
    }
  };
};

const logOut = () => {
  // const { setUserInfo } = useUserInfo();

  return async (dispatch) => {
    try {
      dispatch(logoutBegin());
      Cookies.remove('logedIn');
      Cookies.remove('access_token');
      Cookies.remove('role');
      // setUserInfo(null);
      dispatch(logoutSuccess(null));
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

export { login, logOut };
