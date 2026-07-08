import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useThemeSidebar } from '../../../context/marketbridge/SidebarContext';
import { useAuth } from '../../../context/marketbridge/AuthContext';
import Spinner from '../ui/Spinner';

export default function Layout() {
  const { sidebarOpen } = useThemeSidebar();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"><Spinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/marketbridge/login" state={{ from: location }} replace />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-200">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}