import { useQuery } from '@tanstack/react-query';
import { authUserAPI } from '../api/authAPI';

export const useAuthUser = () => {
    const token = localStorage.getItem('accessToken');
    return useQuery({
        queryKey: ['authUser'],
        queryFn: authUserAPI,
        enabled: !!token,
        retry: false, // 실패하면 재시도 안함
    });
};