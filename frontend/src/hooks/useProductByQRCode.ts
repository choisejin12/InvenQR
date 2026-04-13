import { useMutation } from '@tanstack/react-query';
import { getProductByQRCodeAPI } from '../api/productAPI';

export const useProductByQRCode = () =>
  useMutation({
    mutationFn: (qrCode: string) => getProductByQRCodeAPI(qrCode),
  });
