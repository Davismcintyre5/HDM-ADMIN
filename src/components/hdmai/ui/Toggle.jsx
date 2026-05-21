export default function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        {label && <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>}
        {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 ${checked ? 'bg-fuchsia-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}