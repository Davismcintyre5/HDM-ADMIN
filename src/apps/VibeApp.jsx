import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/vibe/AuthContext';
import { ThemeSidebarProvider } from '../context/vibe/ThemeSidebarContext';
import Layout from '../components/vibe/layout/Layout';
import Login from '../pages/vibe/Login';
import vibeRoutes from '../routes/vibe';

export default function VibeApp() {
  return (
    <AuthProvider>
      <ThemeSidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            {vibeRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/vibe/login" replace />} />
        </Routes>
      </ThemeSidebarProvider>
    </AuthProvider>
  );
}