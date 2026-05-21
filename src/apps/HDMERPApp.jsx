import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/hdmerp/AuthContext';
import { ThemeSidebarProvider } from '../context/hdmerp/ThemeSidebarContext';
import Layout from '../components/hdmerp/layout/Layout';
import Login from '../pages/hdmerp/Login';
import hdmerpRoutes from '../routes/hdmerp';

export default function HDMERPApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {hdmerpRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/hdmerp/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}