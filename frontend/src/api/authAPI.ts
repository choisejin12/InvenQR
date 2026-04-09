import axios from './axios';
import type { LoginRequest } from '../types/auth.type';
import type { RegisterRequest } from '../types/auth.type';


export const registerAPI = async (data: RegisterRequest) => {
  const res = await axios.post('/user/register', data);
  return res.data;
};


export const loginAPI = async (data: LoginRequest) => {
  const res = await axios.post('/user/login', data);

  // accessToken 저장
  localStorage.setItem('accessToken', res.data.accessToken);
  return res.data;
};

export const authUserAPI = async () => {
  try {
    const res = await axios.get('/user/auth');
    return res.data; 
  } catch (err) {
    return null; 
  }
};