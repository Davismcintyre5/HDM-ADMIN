// src/apps/TalantaApp.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../context/talanta/ToastContext';
import { AuthProvider } from '../context/talanta/AuthContext';
import { SidebarProvider } from '../context/talanta/SidebarContext';
import Layout from '../components/talanta/layout/Layout';
import Login from '../pages/talanta/Login';
import talantaRoutes from '../routes/talanta';

export default function TalantaApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />}>
              {talantaRoutes}
            </Route>
            <Route path="*" element={<Navigate to="/talanta/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}