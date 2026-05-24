import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/smartpos/AuthContext';
import { ThemeSidebarProvider } from '../context/smartpos/ThemeSidebarContext';
import Layout from '../components/smartpos/layout/Layout';
import Login from '../pages/smartpos/Login';
import smartposRoutes from '../routes/smartpos';

export default function SmartPOSApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {smartposRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/smartpos/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}