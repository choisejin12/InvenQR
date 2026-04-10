import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function NotAuthRoute() {
  const { isAuth } = useAppSelector((state) => state.user);
  const token = localStorage.getItem('accessToken');

  if (token && !isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        인증 정보를 확인하는 중입니다...
      </div>
    );
  }

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default NotAuthRoute;
