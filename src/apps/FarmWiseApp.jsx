import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/farmwise/AuthContext';
import { SidebarProvider } from '../context/farmwise/SidebarContext';
import Layout from '../components/farmwise/layout/Layout';
import Login from '../pages/farmwise/Login';
import farmwiseRoutes from '../routes/farmwise';

export default function FarmWiseApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {farmwiseRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/farmwise/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}