import axios from './axios';
import type { AxiosError } from 'axios';
import type { DashboardResponse } from '../types/dashboard.type';

export const getDashboardAPI = async (): Promise<DashboardResponse> => {
  try {
    const response = await axios.get<DashboardResponse>('/dashboard');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || '대시보드 데이터를 불러오지 못했습니다.',
    );
  }
};
