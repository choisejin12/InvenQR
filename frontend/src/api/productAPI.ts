import axios from './axios';
import type { ProductListParams, ProductListResponse } from '../types/product.type';

export const getProductsAPI = async (
  params: ProductListParams,
): Promise<ProductListResponse> => {
  const response = await axios.get<ProductListResponse>('/product', {
    params,
  });

  return response.data;
};
