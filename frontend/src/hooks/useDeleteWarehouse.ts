import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWarehouseAPI } from '../api/warehouseAPI';

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWarehouseAPI(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
