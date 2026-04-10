import { useQuery } from '@tanstack/react-query';
import { getWarehousesAPI } from '../api/warehouseAPI';

export const useWarehouses = (enabled = true) =>
  useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehousesAPI,
    enabled,
    retry: false,
  });
