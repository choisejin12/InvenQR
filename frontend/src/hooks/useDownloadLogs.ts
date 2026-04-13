import { useQuery } from '@tanstack/react-query';
import { getDownloadLogsAPI } from '../api/downloadAPI';

export const useDownloadLogs = (enabled = true) =>
  useQuery({
    queryKey: ['download-logs'],
    queryFn: getDownloadLogsAPI,
    enabled,
  });
