import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/marketbridge/SidebarContext';
import { HiHome, HiShoppingBag, HiClock, HiUserGroup, HiSpeakerphone, HiFolder, HiClipboardList, HiExclamation, HiCash, HiCreditCard, HiTruck, HiCurrencyDollar, HiUserCircle, HiCog, HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

const navItems = [
  { to: '/marketbridge', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/marketbridge/stores', icon: HiShoppingBag, label: 'Stores' },
  { to: '/marketbridge/stores/pending', icon: HiClock, label: 'Pending' },
  { to: '/marketbridge/customers', icon: HiUserGroup, label: 'Customers' },
  { to: '/marketbridge/communication', icon: HiSpeakerphone, label: 'Communication' },
  { to: '/marketbridge/categories', icon: HiFolder, label: 'Categories' },
  { to: '/marketbridge/orders', icon: HiClipboardList, label: 'Orders' },
  { to: '/marketbridge/disputes', icon: HiExclamation, label: 'Disputes' },
  { to: '/marketbridge/commissions', icon: HiCash, label: 'Commissions' },
  { to: '/marketbridge/subscriptions', icon: HiCreditCard, label: 'Plans' },
  { to: '/marketbridge/shipping', icon: HiTruck, label: 'Shipping' },
  { to: '/marketbridge/payouts', icon: HiCurrencyDollar, label: 'Payouts' },
  { to: '/marketbridge/accounts', icon: HiCreditCard, label: 'Accounts' },
  { to: '/marketbridge/agents', icon: HiUserCircle, label: 'Agents' },
  { to: '/marketbridge/settings', icon: HiCog, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useThemeSidebar();

  return (
    <>
      {mobileSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-violet-600">
          {sidebarOpen && <span className="text-lg font-bold text-white">MarketBridge</span>}
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/20 text-white hidden lg:block">
            {sidebarOpen ? <HiChevronLeft className="w-5 h-5" /> : <HiChevronRight className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white lg:hidden"><HiX className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />{sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/" className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
          <HiHome className="w-4 h-4 flex-shrink-0" /> {sidebarOpen && 'Return Home'}
        </Link>
        {sidebarOpen && <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">MarketBridge v1.0</div>}
      </aside>
    </>
  );
}