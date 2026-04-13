import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockInAPI } from '../api/inventoryAPI';
import type { StockMovementPayload } from '../types/inventory.type';

export const useStockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementPayload) => stockInAPI(payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['product-detail', variables.productId] }),
        queryClient.invalidateQueries({ queryKey: ['product-inventory-logs', variables.productId] }),
      ]);
    },
  });
};
