import { NavLink } from 'react-router-dom';

export default function Tabs({ tabs, basePath }) {
  return (
    <div className="border-b border-[var(--border-color)] overflow-x-auto">
      <nav className="flex gap-0 -mb-px">
        {tabs.map(tab => (
          <NavLink key={tab.key} to={`${basePath}/${tab.key}`}
            className={({ isActive }) => `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}