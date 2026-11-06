// src/components/talanta/layout/Sidebar.jsx
import { NavLink, Link } from 'react-router-dom';
import { useThemeSidebar } from '../../../context/talanta/SidebarContext';
import {
  HiHome,
  HiTicket,
  HiTag,
  HiQuestionMarkCircle,
  HiMail,
  HiCash,
  HiPhotograph,
  HiCog,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from 'react-icons/hi';

const NAV_SECTIONS = [
  {
    group: null,
    items: [
      { to: '/talanta', icon: HiHome, label: 'Dashboard', end: true },
    ],
  },
  {
    group: 'Match',
    items: [
      { to: '/talanta/match', icon: HiTicket, label: 'Match' },
      { to: '/talanta/categories', icon: HiTag, label: 'Categories' },
      { to: '/talanta/images', icon: HiPhotograph, label: 'Images' },
    ],
  },
  {
    group: 'Content',
    items: [
      { to: '/talanta/faqs', icon: HiQuestionMarkCircle, label: 'FAQs' },
      { to: '/talanta/notify', icon: HiMail, label: 'Notify List' },
    ],
  },
  {
    group: 'Ticketing',
    items: [
      { to: '/talanta/tickets', icon: HiTicket, label: 'Tickets' },
      { to: '/talanta/payments', icon: HiCash, label: 'Payments' },
    ],
  },
  {
    group: 'System',
    items: [
      { to: '/talanta/settings', icon: HiCog, label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useThemeSidebar();

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
        {/* Brand bar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-sky-600">
          {sidebarOpen ? (
            <span className="text-lg font-bold text-white truncate">
              Talanta
            </span>
          ) : (
            <span className="text-lg font-bold text-white">T</span>
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.group || `section-${idx}`} className="mb-4">
              {sidebarOpen && section.group && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {section.group}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileSidebarOpen(false)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
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
          ))}
        </nav>

        {/* Return Home */}
        <Link
          to="/"
          className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
        >
          <HiHome className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && 'Return Home'}
        </Link>

        {sidebarOpen && (
          <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] text-center">
            Talanta v1.0
          </div>
        )}
      </aside>
    </>
  );
}