import axios from './axios';
import type { CategoryItem } from '../types/category.type';

export const getCategoriesAPI = async (): Promise<CategoryItem[]> => {
  const response = await axios.get<CategoryItem[]>('/category');

  return response.data;
};
