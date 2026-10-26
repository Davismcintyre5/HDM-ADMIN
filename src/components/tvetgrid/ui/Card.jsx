export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-sm ${padding ? 'p-4 sm:p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}