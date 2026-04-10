import { useQuery } from '@tanstack/react-query';
import { getAdminProductRequestsAPI } from '../api/productRequestAPI';
import type { ProductRequestStatus } from '../types/productRequest.type';

export const useAdminProductRequests = (
  status: ProductRequestStatus | 'ALL',
  limit = 100,
) =>
  useQuery({
    queryKey: ['admin-product-requests', status, limit],
    queryFn: () => getAdminProductRequestsAPI({ status, page: 1, limit }),
  });
