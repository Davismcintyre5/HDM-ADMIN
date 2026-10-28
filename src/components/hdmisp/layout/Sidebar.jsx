import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/hdmisp/SidebarContext';
import { useAuth } from '../../../context/hdmisp/AuthContext';
import {
  HiViewGrid,
  HiHeart,
  HiClock,
  HiUsers,
  HiCash,
  HiCreditCard,
  HiDocumentText,
  HiTemplate,
  HiScale,
  HiBell,
  HiChartBar,
  HiShieldCheck,
  HiCog,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiHome,
} from 'react-icons/hi';

const NAV = [
  { group: 'Overview', items: [
    { to: '/hdmisp', icon: HiViewGrid, label: 'Dashboard', end: true },
    { to: '/hdmisp/health', icon: HiHeart, label: 'Health' },
  ]},
  { group: 'Providers', items: [
    { to: '/hdmisp/pending', icon: HiClock, label: 'Pending' },
    { to: '/hdmisp/providers', icon: HiUsers, label: 'Providers' },
  ]},
  { group: 'Billing', items: [
    { to: '/hdmisp/transactions', icon: HiCash, label: 'Transactions' },
    { to: '/hdmisp/pending-payments', icon: HiCreditCard, label: 'Pending Payments' },
    { to: '/hdmisp/billing-plans', icon: HiTemplate, label: 'Billing Plans' },
    { to: '/hdmisp/invoices', icon: HiDocumentText, label: 'Invoices' },
  ]},
  { group: 'Platform', items: [
    { to: '/hdmisp/payment-methods', icon: HiCreditCard, label: 'Payment Methods' },
    { to: '/hdmisp/legal', icon: HiScale, label: 'Legal' },
    { to: '/hdmisp/notifications', icon: HiBell, label: 'Notifications' },
    { to: '/hdmisp/reports', icon: HiChartBar, label: 'Reports' },
    { to: '/hdmisp/admins', icon: HiShieldCheck, label: 'Admins', superadmin: true },
    { to: '/hdmisp/settings', icon: HiCog, label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } =
    useThemeSidebar();
  const { isSuperadmin } = useAuth();

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
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-gradient-to-r from-cyan-600 to-blue-600">
          {sidebarOpen && (
            <span className="text-lg font-bold text-white truncate">HDM ISP</span>
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
          {NAV.map((section) => {
            const items = section.items.filter(
              (i) => !i.superadmin || isSuperadmin
            );
            if (items.length === 0) return null;
            return (
              <div key={section.group} className="mb-4">
                {sidebarOpen && (
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {section.group}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                            }`
                          }
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {sidebarOpen && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
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
            HDM ISP v1.0
          </div>
        )}
      </aside>
    </>
  );
}