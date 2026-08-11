import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/farmvexa/AuthContext';
import { SidebarProvider } from '../context/farmvexa/SidebarContext';
import Layout from '../components/farmvexa/layout/Layout';
import Login from '../pages/farmvexa/Login';
import farmvexaRoutes from '../routes/farmvexa';

export default function FarmVexaApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {farmvexaRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/farmvexa/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}