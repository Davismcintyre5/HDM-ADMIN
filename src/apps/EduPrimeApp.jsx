import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/eduprime/AuthContext';
import { SidebarProvider } from '../context/eduprime/SidebarContext';
import Layout from '../components/eduprime/layout/Layout';
import Login from '../pages/eduprime/Login';
import eduprimeRoutes from '../routes/eduprime';

export default function EduPrimeApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {eduprimeRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/eduprime/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}