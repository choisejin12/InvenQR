import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import {toast} from 'react-toastify';

function AdminRoute() {
  const { userData, isAuth } = useAppSelector((state) => state.user);
  const token = localStorage.getItem('accessToken');

  if (token && !isAuth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        관리자 권한을 확인하는 중입니다...
      </div>
    );
  }

  if (!userData || userData.role !== 'ADMIN') {
    toast.error('관리자만 접근가능합니다.')
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
