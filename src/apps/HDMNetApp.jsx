import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/hdmnet/AuthContext';
import { SidebarProvider } from '../context/hdmnet/SidebarContext';
import Layout from '../components/hdmnet/layout/Layout';
import Login from '../pages/hdmnet/Login';
import hdmnetRoutes from '../routes/hdmnet';

export default function HDMNetApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {hdmnetRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/hdmnet/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}