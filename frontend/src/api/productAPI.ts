import type { AxiosError } from 'axios';
import axios from './axios';
import type {
  CreateProductPayload,
  ProductDetailItem,
  ProductListParams,
  ProductListResponse,
  UpdateProductPayload,
} from '../types/product.type';

const normalizeProductError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return new Error(
    axiosError.response?.data?.message || '상품 요청 처리 중 문제가 발생했습니다.',
  );
};

export const getProductsAPI = async (
  params: ProductListParams,
): Promise<ProductListResponse> => {
  const response = await axios.get<ProductListResponse>('/product', {
    params,
  });

  return response.data;
};

export const getProductDetailAPI = async (productId: number): Promise<ProductDetailItem> => {
  const response = await axios.get<ProductDetailItem>(`/product/${productId}`);
  return response.data;
};

export const getProductByQRCodeAPI = async (qrCode: string): Promise<ProductDetailItem> => {
  const response = await axios.get<ProductDetailItem>(
    `/product/qr/${encodeURIComponent(qrCode)}`,
  );
  return response.data;
};

export const createProductAPI = async (payload: CreateProductPayload) => {
  try {
    const response = await axios.post('/product', payload);
    return response.data;
  } catch (error) {
    throw normalizeProductError(error);
  }
};

export const updateProductAPI = async ({ id, ...payload }: UpdateProductPayload) => {
  try {
    const response = await axios.patch(`/product/${id}`, payload);
    return response.data;
  } catch (error) {
    throw normalizeProductError(error);
  }
};

export const deleteProductAPI = async (id: number) => {
  try {
    const response = await axios.delete(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeProductError(error);
  }
};
