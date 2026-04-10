import { useQuery } from '@tanstack/react-query';
import { getCategoriesAPI } from '../api/categoryAPI';

export const useCategories = (enabled = true) =>
  useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesAPI,
    enabled,
    retry: false,
  });
