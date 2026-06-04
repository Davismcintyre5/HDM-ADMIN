import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/bizhub/AuthContext';
import { ThemeSidebarProvider } from '../context/bizhub/ThemeSidebarContext';
import Layout from '../components/bizhub/layout/Layout';
import Login from '../pages/bizhub/Login';
import bizhubRoutes from '../routes/bizhub';

export default function BizhubApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {bizhubRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/bizhub/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}