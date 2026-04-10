import axios from './axios';
import type { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.type';

export const registerAPI = async (data: RegisterRequest) => {
  const response = await axios.post('/user/register', data);
  return response.data;
};

export const loginAPI = async (data: LoginRequest): Promise<AuthUser> => {
  const response = await axios.post<LoginResponse>('/user/login', data);

  localStorage.setItem('accessToken', response.data.accessToken);

  return response.data.user;
};

export const authUserAPI = async (): Promise<AuthUser | null> => {
  try {
    const response = await axios.get<AuthUser>('/user/auth');
    return response.data;
  } catch {
    return null;
  }
};
