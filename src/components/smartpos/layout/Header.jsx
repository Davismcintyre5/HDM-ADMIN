import { HiMenuAlt2, HiSun, HiMoon, HiLogout, HiBell } from 'react-icons/hi';
import { useThemeSidebar } from '../../../context/smartpos/SidebarContext';
import { useAuth } from '../../../context/smartpos/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../../../services/smartpos/notifications';

export default function Header() {
  const { darkMode, toggleTheme, toggleMobileSidebar } = useThemeSidebar();
  const { admin, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(res => setUnread(res?.data?.count || 0)).catch(() => {});
    const i = setInterval(() => {
      getUnreadCount().then(res => setUnread(res?.data?.count || 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="h-16 bg-[var(--header-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button onClick={toggleMobileSidebar} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] lg:hidden"><HiMenuAlt2 className="w-6 h-6" /></button>
        <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block">Welcome back{admin?.name ? `, ${admin.name}` : ''}</span>
      </div>
      <div className="flex items-center gap-2">
        {unread > 0 && (
          <div className="relative p-2 rounded-lg text-[var(--text-secondary)]">
            <HiBell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>
          </div>
        )}
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] transition-colors" title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {(admin?.name || admin?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-[var(--text-secondary)] hidden md:block">{admin?.name || admin?.email || 'Admin'}</span>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors" title="Logout">
          <HiLogout className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}