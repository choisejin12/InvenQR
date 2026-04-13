import { useQuery } from '@tanstack/react-query';
import { getInventoryLogsAPI } from '../api/inventoryAPI';
import type { InventoryLogListParams } from '../types/inventory.type';

export const useInventoryLogs = (params: InventoryLogListParams, enabled = true) =>
  useQuery({
    queryKey: ['inventory-logs', params],
    queryFn: () => getInventoryLogsAPI(params),
    enabled,
  });
