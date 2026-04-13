import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductAPI } from '../api/productAPI';
import type { UpdateProductPayload } from '../types/product.type';

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => updateProductAPI(payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-logs'] }),
        queryClient.invalidateQueries({ queryKey: ['product-detail', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['product-inventory-logs', variables.id] }),
      ]);
    },
  });
};
