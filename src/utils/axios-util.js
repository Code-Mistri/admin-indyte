import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINT } from './endpoints';

export const api = axios.create({
  baseURL: API_ENDPOINT,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    // const token = cookie.split(' ').at(1);
    console.log({ tokentoken: token });
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
