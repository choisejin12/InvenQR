import { useQuery } from '@tanstack/react-query';
import { getProductsAPI } from '../api/productAPI';
import type { ProductListParams } from '../types/product.type';

export const useProducts = (params: ProductListParams) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsAPI(params),
  });
