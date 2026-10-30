export default function PageHeader({ title, description, action, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        {title && (
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}