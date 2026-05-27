import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/vault/AuthContext';
import { ThemeSidebarProvider } from '../context/vault/ThemeSidebarContext';
import Layout from '../components/vault/layout/Layout';
import Login from '../pages/vault/Login';
import vaultRoutes from '../routes/vault';

export default function HDMVaultApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {vaultRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/vault/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}