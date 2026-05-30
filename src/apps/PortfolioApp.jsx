import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/portfolio/AuthContext';
import { ThemeSidebarProvider } from '../context/portfolio/ThemeSidebarContext';
import Layout from '../components/portfolio/layout/Layout';
import Login from '../pages/portfolio/Login';
import portfolioRoutes from '../routes/portfolio';

export default function PortfolioApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {portfolioRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/portfolio/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}