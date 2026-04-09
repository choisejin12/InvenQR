import { useMutation } from '@tanstack/react-query';
import { registerAPI } from '../api/authAPI';
import type {RegisterRequest} from '../api/authAPI';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => registerAPI(data),
  });
};