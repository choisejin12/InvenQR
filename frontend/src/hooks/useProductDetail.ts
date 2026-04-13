import { useQuery } from '@tanstack/react-query';
import { getProductDetailAPI } from '../api/productAPI';

export const useProductDetail = (productId: number, enabled = true) =>
  useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => getProductDetailAPI(productId),
    enabled,
  });
