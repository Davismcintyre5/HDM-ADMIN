import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/nexguard/AuthContext';
import { SidebarProvider } from '../context/nexguard/SidebarContext';
import Layout from '../components/nexguard/layout/Layout';
import Login from '../pages/nexguard/Login';
import nexguardRoutes from '../routes/nexguard';

export default function NexGuardApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {nexguardRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/nexguard/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}