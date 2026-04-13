import { useQuery } from '@tanstack/react-query';
import { getProductInventoryLogsAPI } from '../api/inventoryAPI';

export const useProductInventoryLogs = (
  productId: number,
  page = 1,
  limit = 8,
  enabled = true,
) =>
  useQuery({
    queryKey: ['product-inventory-logs', productId, page, limit],
    queryFn: () => getProductInventoryLogsAPI({ productId, page, limit }),
    enabled,
  });
