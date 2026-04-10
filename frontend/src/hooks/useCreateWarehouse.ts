import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWarehouseAPI } from '../api/warehouseAPI';
import type { CreateWarehousePayload } from '../types/warehouse.type';

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWarehousePayload) => createWarehouseAPI(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
