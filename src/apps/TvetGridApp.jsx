import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../context/tvetgrid/ToastContext';
import { AuthProvider } from '../context/tvetgrid/AuthContext';
import { SidebarProvider } from '../context/tvetgrid/SidebarContext';
import Layout from '../components/tvetgrid/layout/Layout';
import Login from '../pages/tvetgrid/Login';
import tvetgridRoutes from '../routes/tvetgrid';

export default function TvetGridApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />}>
              {tvetgridRoutes}
            </Route>
            <Route path="*" element={<Navigate to="/tvetgrid/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}