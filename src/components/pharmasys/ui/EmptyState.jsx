export default function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon className="w-10 h-10 text-[var(--text-muted)] mb-3" />}
      <h3 className="text-base font-medium text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}