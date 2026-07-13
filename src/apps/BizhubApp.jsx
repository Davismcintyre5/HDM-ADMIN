import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/bizhub/AuthContext';
import { SidebarProvider } from '../context/bizhub/SidebarContext';
import Layout from '../components/bizhub/layout/Layout';
import Login from '../pages/bizhub/Login';
import bizhubRoutes from '../routes/bizhub';

export default function BizhubApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {bizhubRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/bizhub/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}