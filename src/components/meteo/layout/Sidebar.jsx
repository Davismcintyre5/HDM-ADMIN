import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/meteo/SidebarContext';
import { useAuth } from '../../../context/meteo/AuthContext';
import {
  HiViewGrid,
  HiClock,
  HiOfficeBuilding,
  HiUsers,
  HiCube,
  HiDocumentText,
  HiCash,
  HiCreditCard,
  HiKey,
  HiDatabase,
  HiHeart,
  HiCog,
  HiShieldCheck,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiHome,
} from 'react-icons/hi';

const NAV = [
  { to: '/meteo', icon: HiViewGrid, label: 'Dashboard', end: true },
  { to: '/meteo/pending', icon: HiClock, label: 'Pending' },
  { to: '/meteo/tenants', icon: HiOfficeBuilding, label: 'Tenants' },
  { to: '/meteo/users', icon: HiUsers, label: 'Users' },
  { to: '/meteo/plans', icon: HiCube, label: 'Plans' },
  { to: '/meteo/invoices', icon: HiDocumentText, label: 'Invoices' },
  { to: '/meteo/payments', icon: HiCash, label: 'Payments' },
  { to: '/meteo/payment-methods', icon: HiCreditCard, label: 'Payment Methods' },
  { to: '/meteo/api-keys', icon: HiKey, label: 'API Keys' },
  { to: '/meteo/settings', icon: HiCog, label: 'Settings' },
  { to: '/meteo/backups', icon: HiDatabase, label: 'Backups' },
  { to: '/meteo/health', icon: HiHeart, label: 'Health' },
];

export default function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useThemeSidebar();
  const { isSuperAdmin } = useAuth();

  const items = [
    ...NAV,
    ...(isSuperAdmin
      ? [{ to: '/meteo/admins', icon: HiShieldCheck, label: 'Admins' }]
      : []),
  ];

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-gradient-to-r from-violet-600 to-purple-600">
          {sidebarOpen && (
            <span className="text-lg font-bold text-white truncate">
              HDM METEO
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white hidden lg:block"
            type="button"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <HiChevronLeft className="w-5 h-5" />
            ) : (
              <HiChevronRight className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white lg:hidden"
            type="button"
            aria-label="Close menu"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          to="/"
          className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
        >
          <HiHome className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && 'Return Home'}
        </Link>

        {sidebarOpen && (
          <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">
            HDM METEO v1.0
          </div>
        )}
      </aside>
    </>
  );
}