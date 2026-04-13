import type { AxiosError } from 'axios';
import axios from './axios';
import type {
  InventoryLogListParams,
  InventoryLogListResponse,
  ProductInventoryLogParams,
  StockMovementPayload,
} from '../types/inventory.type';

const normalizeInventoryError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return new Error(
    axiosError.response?.data?.message || '입출고 요청 처리 중 문제가 발생했습니다.',
  );
};

export const getProductInventoryLogsAPI = async ({
  productId,
  page = 1,
  limit = 8,
}: ProductInventoryLogParams): Promise<InventoryLogListResponse> => {
  const response = await axios.get<InventoryLogListResponse>(
    `/inventory/products/${productId}/logs`,
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
};

export const getInventoryLogsAPI = async (
  params: InventoryLogListParams,
): Promise<InventoryLogListResponse> => {
  const response = await axios.get<InventoryLogListResponse>('/inventory/logs', {
    params,
  });

  return response.data;
};

export const stockInAPI = async (payload: StockMovementPayload) => {
  try {
    const response = await axios.post('/inventory/in', payload);
    return response.data;
  } catch (error) {
    throw normalizeInventoryError(error);
  }
};

export const stockOutAPI = async (payload: StockMovementPayload) => {
  try {
    const response = await axios.post('/inventory/out', payload);
    return response.data;
  } catch (error) {
    throw normalizeInventoryError(error);
  }
};
