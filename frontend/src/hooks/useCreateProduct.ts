import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductAPI } from '../api/productAPI';
import type { CreateProductPayload } from '../types/product.type';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProductAPI(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-logs'] }),
      ]);
    },
  });
};
