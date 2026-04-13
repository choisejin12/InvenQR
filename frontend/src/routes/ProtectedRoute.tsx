import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function ProtectedRoute() {
  const { isAuth } = useAppSelector((state) => state.user);
  const token = localStorage.getItem('accessToken');

  // 새로고침 직후에는 Redux가 비어 있어도 토큰이 있으면 인증 복구 중일수도있음
  if (token && !isAuth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        인증 정보를 확인하는 중입니다...
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
