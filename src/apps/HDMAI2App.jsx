import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/hdmai2/AuthContext';
import { SidebarProvider } from '../context/hdmai2/SidebarContext';
import Layout from '../components/hdmai2/layout/Layout';
import Login from '../pages/hdmai2/Login';
import hdmai2Routes from '../routes/hdmai2';

export default function HDMAI2App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {hdmai2Routes}
          </Route>
          <Route path="*" element={<Navigate to="/hdmai2/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}