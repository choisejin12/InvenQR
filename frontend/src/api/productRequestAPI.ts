import axios from './axios';
import type { AxiosError } from 'axios';
import type {
  CreateProductRequestPayload,
  ProductRequestListResponse,
  ProductRequestStatus,
  RejectProductRequestPayload,
} from '../types/productRequest.type';

type ProductRequestListParams = {
  status?: ProductRequestStatus | 'ALL';
  page?: number;
  limit?: number;
};

const normalizeError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return new Error(
    axiosError.response?.data?.message || '상품 등록 요청 처리 중 서버 오류가 발생했습니다.',
  );
};

const buildParams = (params: ProductRequestListParams) => ({
  ...params,
  status: params.status === 'ALL' ? undefined : params.status,
});

export const createProductRequestAPI = async (payload: CreateProductRequestPayload) => {
  try {
    const response = await axios.post('/requestproduct', payload);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

export const getAdminProductRequestsAPI = async (
  params: ProductRequestListParams,
): Promise<ProductRequestListResponse> => {
  try {
    const response = await axios.get<ProductRequestListResponse>('/requestproduct', {
      params: buildParams(params),
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getMyProductRequestsAPI = async (
  params: ProductRequestListParams,
): Promise<ProductRequestListResponse> => {
  try {
    const response = await axios.get<ProductRequestListResponse>('/requestproduct/myrequest', {
      params: buildParams(params),
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const approveProductRequestAPI = async (requestId: number) => {
  try {
    const response = await axios.patch(`/requestproduct/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const rejectProductRequestAPI = async (
  requestId: number,
  payload: RejectProductRequestPayload,
) => {
  try {
    const response = await axios.patch(`/requestproduct/${requestId}/reject`, payload);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
