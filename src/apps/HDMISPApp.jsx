import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../context/hdmisp/ToastContext';
import { AuthProvider } from '../context/hdmisp/AuthContext';
import { SidebarProvider } from '../context/hdmisp/SidebarContext';
import Layout from '../components/hdmisp/layout/Layout';
import Login from '../pages/hdmisp/Login';
import hdmispRoutes from '../routes/hdmisp';

export default function HDMISPApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />}>
              {hdmispRoutes}
            </Route>
            <Route path="*" element={<Navigate to="/hdmisp/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}