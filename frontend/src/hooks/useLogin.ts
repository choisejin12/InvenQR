import { useMutation } from '@tanstack/react-query';
import { loginAPI } from '../api/authAPI';
import type { LoginRequest } from '../types/auth.type';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => loginAPI(data),
  });
};