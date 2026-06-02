import { HiMenuAlt2, HiSun, HiMoon, HiLogout } from 'react-icons/hi';
import { useThemeSidebar } from '../../../context/vibe/ThemeSidebarContext';
import { useAuth } from '../../../context/vibe/AuthContext';

export default function Header() {
  const { darkMode, toggleTheme, toggleMobileSidebar } = useThemeSidebar();
  const { admin, logout } = useAuth();

  return (
    <header className="h-16 bg-[var(--header-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button onClick={toggleMobileSidebar} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] lg:hidden"><HiMenuAlt2 className="w-6 h-6" /></button>
        <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block">
          Welcome back{admin?.firstName ? `, ${admin.firstName}` : admin?.name ? `, ${admin.name}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]" title={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}</button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            {admin?.firstName?.charAt(0)?.toUpperCase() || admin?.name?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <span className="text-sm text-[var(--text-secondary)] hidden md:block">{admin?.firstName || admin?.name || admin?.email || 'Admin'}</span>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600" title="Logout"><HiLogout className="w-5 h-5" /></button>
      </div>
    </header>
  );
}