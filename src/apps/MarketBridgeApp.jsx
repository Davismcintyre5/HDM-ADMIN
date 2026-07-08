import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/marketbridge/AuthContext';
import { SidebarProvider } from '../context/marketbridge/SidebarContext';
import Layout from '../components/marketbridge/layout/Layout';
import Login from '../pages/marketbridge/Login';
import marketbridgeRoutes from '../routes/marketbridge';

export default function MarketBridgeApp() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {marketbridgeRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/marketbridge/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}