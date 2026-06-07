import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/bridge/AuthContext';
import { ThemeSidebarProvider } from '../context/bridge/ThemeSidebarContext';
import Layout from '../components/bridge/layout/Layout';
import Login from '../pages/bridge/Login';
import bridgeRoutes from '../routes/bridge';

export default function BridgeApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {bridgeRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/bridge/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}