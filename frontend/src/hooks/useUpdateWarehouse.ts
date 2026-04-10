import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWarehouseAPI } from '../api/warehouseAPI';
import type { UpdateWarehousePayload } from '../types/warehouse.type';

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWarehousePayload) => updateWarehouseAPI(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
