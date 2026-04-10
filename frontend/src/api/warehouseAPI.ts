import axios from './axios';
import type { AxiosError } from 'axios';
import type {
  CreateWarehousePayload,
  UpdateWarehousePayload,
  WarehouseItem,
} from '../types/warehouse.type';

const normalizeWarehouseError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return new Error(
    axiosError.response?.data?.message || '창고 요청 처리 중 서버 오류가 발생했습니다.',
  );
};

export const getWarehousesAPI = async (): Promise<WarehouseItem[]> => {
  const response = await axios.get<WarehouseItem[]>('/warehouse');

  return response.data;
};

export const createWarehouseAPI = async (
  payload: CreateWarehousePayload,
): Promise<WarehouseItem> => {
  try {
    const response = await axios.post<WarehouseItem>('/warehouse', payload);
    return response.data;
  } catch (error) {
    throw normalizeWarehouseError(error);
  }
};

export const updateWarehouseAPI = async ({
  id,
  ...payload
}: UpdateWarehousePayload): Promise<WarehouseItem> => {
  try {
    const response = await axios.patch<WarehouseItem>(`/warehouse/${id}`, payload);
    return response.data;
  } catch (error) {
    throw normalizeWarehouseError(error);
  }
};

export const deleteWarehouseAPI = async (id: number) => {
  try {
    const response = await axios.delete(`/warehouse/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeWarehouseError(error);
  }
};
