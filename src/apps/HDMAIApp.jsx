import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/hdmai/AuthContext';
import { ThemeSidebarProvider } from '../context/hdmai/ThemeSidebarContext';
import Layout from '../components/hdmai/layout/Layout';
import Login from '../pages/hdmai/Login';
import hdmaiRoutes from '../routes/hdmai';

export default function HDMAIApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {hdmaiRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/hdmai/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}