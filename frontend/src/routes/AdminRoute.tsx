import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function AdminRoute() {
  const { userData } = useAppSelector((state) => state.user);

  if (!userData || userData.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;