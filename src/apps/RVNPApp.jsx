import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/rvnp/AuthContext';
import { SidebarProvider } from '../context/rvnp/SidebarContext';
import Layout from '../components/rvnp/layout/Layout';
import Login from '../pages/rvnp/Login';
import rvnpRoutes from '../routes/rvnp';

export default function RVNPApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {rvnpRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/rvnp/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}