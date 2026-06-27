import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/hdmai/SidebarContext';
import { HiHome, HiUsers, HiKey, HiCode, HiChartBar, HiHeart, HiCog, HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

const navItems = [
  { to: '/hdmai', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/hdmai/users', icon: HiUsers, label: 'Users' },
  { to: '/hdmai/keys', icon: HiKey, label: 'AI Keys' },
  { to: '/hdmai/project-keys', icon: HiCode, label: 'Project Keys' },
  { to: '/hdmai/usage', icon: HiChartBar, label: 'Usage' },
  { to: '/hdmai/health', icon: HiHeart, label: 'Health' },
  { to: '/hdmai/settings', icon: HiCog, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useThemeSidebar();

  return (
    <>
      {mobileSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-fuchsia-600">
          {sidebarOpen && <span className="text-lg font-bold text-white">HDM AI</span>}
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
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />{sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/" className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
          <HiHome className="w-4 h-4 flex-shrink-0" /> {sidebarOpen && 'Return Home'}
        </Link>
        {sidebarOpen && <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">HDM AI v2.0</div>}
      </aside>
    </>
  );
}