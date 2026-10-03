import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/pharmasys/AuthContext';
import { SidebarProvider } from '../context/pharmasys/SidebarContext';
import { ToastProvider } from '../context/pharmasys/ToastContext';
import Layout from '../components/pharmasys/layout/Layout';
import Login from '../pages/pharmasys/Login';
import pharmasysRoutes from '../routes/pharmasys';

export default function PharmaSysApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />}>
              {pharmasysRoutes}
            </Route>
            <Route path="*" element={<Navigate to="/pharmasys/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}