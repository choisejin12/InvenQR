import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DashboardPage from './pages/DashboardPage';
import DetailProductPage from './pages/DetailProductPage';
import DownloadCSVPage from './pages/DownloadCSVPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import RegisterPage from './pages/RegisterPage';
import RequestProductPage from './pages/RequestProductPage';
import ScanPage from './pages/ScanPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPage from './pages/admin/AdminPage';
import AdminProductPage from './pages/admin/AdminProductPage';
import AdminRequestProductPage from './pages/admin/AdminRequestProductPage';
import { useAuthUser } from './hooks/useAuthUser';
import NavBar from './layouts';
import AdminRoute from './routes/AdminRoute';
import NotAuthRoute from './routes/NotAuthRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAppDispatch } from './store/hooks';
import { logout, setUser } from './store/userSlice';

function App() {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('accessToken');
  const { data, isSuccess } = useAuthUser();

  useEffect(() => {
    if (!token) {
      dispatch(logout());
      return;
    }

    if (isSuccess) {
      if (data) {
        dispatch(setUser(data));
      } else {
        dispatch(logout());
      }
    }
  }, [data, dispatch, isSuccess, token]);

  return (
    <BrowserRouter>
      <ToastContainer position="bottom-right" theme="light" pauseOnHover autoClose={2000} />
      <Routes>
        <Route element={<NotAuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<NavBar />}>
          <Route path="/" element={<DashboardPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/:productId" element={<DetailProductPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/csv" element={<DownloadCSVPage />} />
            <Route path="/requestproduct" element={<RequestProductPage />} />

            <Route element={<AdminRoute />}>
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
