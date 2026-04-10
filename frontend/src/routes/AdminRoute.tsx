import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

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
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
