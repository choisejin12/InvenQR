import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import NotAuthRoute from './routes/NotAuthRoute';
import AdminRoute from './routes/AdminRoute';
import { ToastContainer } from 'react-toastify';

import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import DetailProductPage from './pages/DetailProductPage';
import InventoryPage from './pages/InventoryPage';
import ScanPage from './pages/ScanPage';
import DownloadCSVPage from './pages/DownloadCSVPage';
import RequestProductPage from './pages/RequestProductPage';
import AdminPage from './pages/admin/AdminPage';
import AdminProductPage from './pages/admin/AdminProductPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminRequestProductPage from './pages/admin/AdminRequestProductPage';

import { useEffect } from 'react';
import { useAuthUser } from './hooks/useAuthUser';
import { useDispatch } from 'react-redux';
import { setUser, logout } from './store/userSlice';

import NavBar from './layouts';


function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');

  const { data, isSuccess, isError } = useAuthUser();

  useEffect(() => {
    if (!token) return;

    if (isSuccess && data) {
      dispatch(setUser({
        userData: data,
        isAuth: true,
      }));
    }

    if (isError) {
      dispatch(logout());
    }
  }, [isSuccess, isError, data, dispatch, token]);
  
  return (
    <BrowserRouter>
      <ToastContainer position='bottom-right' theme='light' pauseOnHover autoClose={2000}/>
      <Routes>
        {/* 로그인 안된 사람만 */}
        <Route element={<NotAuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<NavBar/>}>
          <Route path='/' element={<DashboardPage />} />
          {/* 로그인 된 사람만 */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/:productId" element={<DetailProductPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/csv" element={<DownloadCSVPage />} />
            <Route path="/requestproduct" element={<RequestProductPage />} />
            {/* 관리자만 */}
            <Route element={<AdminRoute/>}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/product" element={<AdminProductPage />} />
              <Route path="/admin/inventorylog" element={<AdminInventoryPage />} />
              <Route path="/admin/requestproduct" element={<AdminRequestProductPage />} />
            </Route>
          </Route>        
        
        
        </Route>



      </Routes>
    </BrowserRouter>
  );
}

export default App;