import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/smartpos/AuthContext';
import { SidebarProvider } from '../context/smartpos/SidebarContext';
import Layout from '../components/smartpos/layout/Layout';
import Login from '../pages/smartpos/Login';
import smartposRoutes from '../routes/smartpos';

export default function SmartPOSApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {smartposRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/smartpos/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}