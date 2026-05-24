import { NavLink } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/smartpos/ThemeSidebarContext';
import { HiViewGrid, HiOfficeBuilding, HiCash, HiCreditCard, HiCog, HiSparkles, HiMail, HiDatabase, HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/smartpos', icon: HiViewGrid, label: 'Dashboard', end: true },
      { to: '/smartpos/clients', icon: HiOfficeBuilding, label: 'Clients' },
      { to: '/smartpos/payments', icon: HiCash, label: 'Payments' },
      { to: '/smartpos/subscription', icon: HiCreditCard, label: 'Subscription' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/smartpos/settings', icon: HiCog, label: 'Settings' },
      { to: '/smartpos/ai-config', icon: HiSparkles, label: 'AI Config' },
      { to: '/smartpos/communication', icon: HiMail, label: 'Communication' },
      { to: '/smartpos/backups', icon: HiDatabase, label: 'Backups' },
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
          {sidebarOpen && <span className="text-lg font-bold text-blue-600 dark:text-blue-400">SmartPOS</span>}
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
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {sidebarOpen && <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">SmartPOS v1.0</div>}
      </aside>
    </>
  );
}