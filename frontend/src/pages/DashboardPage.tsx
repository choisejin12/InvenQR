import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import {  useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <div>
      DashboardPage

    </div>
  )
}

export default DashboardPage
