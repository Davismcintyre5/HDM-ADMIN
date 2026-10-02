export default function Input({ label, error, className = '', readOnly, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>}
      <input
        readOnly={readOnly}
        className={`w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${readOnly ? 'opacity-70 cursor-not-allowed bg-[var(--sidebar-hover)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}