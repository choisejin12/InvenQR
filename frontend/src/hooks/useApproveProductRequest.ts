import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveProductRequestAPI } from '../api/productRequestAPI';

export const useApproveProductRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => approveProductRequestAPI(requestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-product-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['my-product-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
  });
};
