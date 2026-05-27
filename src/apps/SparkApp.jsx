import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/spark/AuthContext';
import { ThemeSidebarProvider } from '../context/spark/ThemeSidebarContext';
import Layout from '../components/spark/layout/Layout';
import Login from '../pages/spark/Login';
import sparkRoutes from '../routes/spark';

export default function SparkApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {sparkRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/spark/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}