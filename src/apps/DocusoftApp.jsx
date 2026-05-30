import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/docusoft/AuthContext';
import { ThemeSidebarProvider } from '../context/docusoft/ThemeSidebarContext';
import Layout from '../components/docusoft/layout/Layout';
import Login from '../pages/docusoft/Login';
import docusoftRoutes from '../routes/docusoft';

export default function DocusoftApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {docusoftRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/docusoft/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}