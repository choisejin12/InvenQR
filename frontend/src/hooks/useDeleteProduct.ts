import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProductAPI } from '../api/productAPI';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProductAPI(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-logs'] }),
      ]);
    },
  });
};
