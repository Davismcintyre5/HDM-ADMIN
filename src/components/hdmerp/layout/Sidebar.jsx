import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/hdmerp/ThemeSidebarContext';
import {
  HiViewGrid, HiOfficeBuilding, HiCheckCircle, HiCreditCard, HiCash,
  HiCog, HiCloudUpload, HiScale, HiDatabase, HiSparkles, HiChevronLeft,
  HiChevronRight, HiX, HiHome
} from 'react-icons/hi';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/hdmerp', icon: HiViewGrid, label: 'Dashboard', end: true },
      { to: '/hdmerp/tenants', icon: HiOfficeBuilding, label: 'Tenants' },
      { to: '/hdmerp/approvals', icon: HiCheckCircle, label: 'Approvals' },
      { to: '/hdmerp/plans', icon: HiCreditCard, label: 'Plans' },
      { to: '/hdmerp/payments', icon: HiCash, label: 'Payments' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/hdmerp/settings', icon: HiCog, label: 'Settings' },
      { to: '/hdmerp/ai-config', icon: HiSparkles, label: 'AI Config' },
      { to: '/hdmerp/uploads', icon: HiCloudUpload, label: 'Uploads' },
      { to: '/hdmerp/legal', icon: HiScale, label: 'Legal' },
      { to: '/hdmerp/backups', icon: HiDatabase, label: 'Backups' },
    ]
  }
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useThemeSidebar();

  return (
    <>
      {mobileSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          {sidebarOpen && <span className="text-lg font-bold text-green-600 dark:text-green-400">HDM ERP</span>}
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] hidden lg:block">
            {sidebarOpen ? <HiChevronLeft className="w-5 h-5" /> : <HiChevronRight className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] lg:hidden"><HiX className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map(section => (
            <div key={section.title}>
              {sidebarOpen && <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{section.title}</p>}
              <ul className="space-y-1">
                {section.items.map(item => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <Link to="/" className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
          <HiHome className="w-4 h-4 flex-shrink-0" /> {sidebarOpen && 'Return Home'}
        </Link>
        {sidebarOpen && <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">HDM ERP v1.0</div>}
      </aside>
    </>
  );
}