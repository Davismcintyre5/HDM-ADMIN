import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/flax/AuthContext';
import { SidebarProvider } from '../context/flax/SidebarContext';
import Layout from '../components/flax/layout/Layout';
import Login from '../pages/flax/Login';
import flaxRoutes from '../routes/flax';

export default function FlaxApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {flaxRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/flax/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}