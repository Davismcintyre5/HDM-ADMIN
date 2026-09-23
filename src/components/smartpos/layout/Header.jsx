import { useEffect, useState } from 'react';
import {
  HiMenuAlt2,
  HiSun,
  HiMoon,
  HiLogout,
} from 'react-icons/hi';
import { useThemeSidebar } from '../../../context/smartpos/SidebarContext';
import { useAuth } from '../../../context/smartpos/AuthContext';
import { initials } from '../../../utils/smartpos/formatters';

export default function Header() {
  const { darkMode, toggleTheme, toggleMobileSidebar } = useThemeSidebar();
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('[data-header-menu]')) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const name = admin?.fullName || admin?.name || admin?.email || 'Admin';
  const email = admin?.email || '';

  return (
    <header className="h-16 bg-[var(--header-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] lg:hidden"
          aria-label="Open menu"
          type="button"
        >
          <HiMenuAlt2 className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block">
          Welcome back, {name.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
          type="button"
        >
          {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        <div className="relative" data-header-menu>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {initials(name)}
            </div>
            <span className="text-sm text-[var(--text-secondary)] hidden md:block">
              {name}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 z-40">
              <div className="px-3 py-2 border-b border-[var(--border-color)]">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {name}
                </p>
                {email && (
                  <p className="text-xs text-[var(--text-muted)] truncate">{email}</p>
                )}
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                type="button"
              >
                <HiLogout className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}