import { useQuery } from '@tanstack/react-query';
import { getDashboardAPI } from '../api/dashboardAPI';

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardAPI,
  });
