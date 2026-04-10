import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectProductRequestAPI } from '../api/productRequestAPI';

export const useRejectProductRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) =>
      rejectProductRequestAPI(requestId, { reason }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-product-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['my-product-requests'] }),
      ]);
    },
  });
};
