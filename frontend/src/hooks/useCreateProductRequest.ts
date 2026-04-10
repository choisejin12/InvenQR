import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductRequestAPI } from '../api/productRequestAPI';
import type { CreateProductRequestPayload } from '../types/productRequest.type';

export const useCreateProductRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductRequestPayload) => createProductRequestAPI(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['my-product-requests'] }),
      ]);
    },
  });
};
