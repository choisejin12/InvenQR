import { useQuery } from '@tanstack/react-query';
import { getMyProductRequestsAPI } from '../api/productRequestAPI';
import type { ProductRequestStatus } from '../types/productRequest.type';

export const useMyProductRequests = (
  status: ProductRequestStatus | 'ALL',
  limit = 100,
) =>
  useQuery({
    queryKey: ['my-product-requests', status, limit],
    queryFn: () => getMyProductRequestsAPI({ status, page: 1, limit }),
  });
