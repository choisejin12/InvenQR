import type { AxiosError } from 'axios';
import axios from './axios';
import type { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.type';

const normalizeAuthError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  return new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      '인증 요청 처리 중 문제가 발생했습니다.',
  );
};

export const registerAPI = async (data: RegisterRequest) => {
  try {
    const response = await axios.post('/user/register', data);
    return response.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const loginAPI = async (data: LoginRequest): Promise<AuthUser> => {
  try {
    const response = await axios.post<LoginResponse>('/user/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.user;
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const authUserAPI = async (): Promise<AuthUser | null> => {
  try {
    const response = await axios.get<AuthUser>('/user/auth');
    return response.data;
  } catch {
    return null;
  }
};
