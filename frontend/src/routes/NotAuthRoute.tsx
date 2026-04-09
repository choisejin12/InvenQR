import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function NotAuthRoute() {
  const { isAuth } = useAppSelector((state) => state.user);

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default NotAuthRoute;