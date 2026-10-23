import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../context/meteo/ToastContext';
import { AuthProvider } from '../context/meteo/AuthContext';
import { SidebarProvider } from '../context/meteo/SidebarContext';
import Layout from '../components/meteo/layout/Layout';
import Login from '../pages/meteo/Login';
import meteoRoutes from '../routes/meteo';

export default function MeteoApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />}>
              {meteoRoutes}
            </Route>
            <Route path="*" element={<Navigate to="/meteo/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}