export default function Table({ columns, data, loading, emptyMessage = 'No data found' }) {
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
      <table className="w-full text-sm text-left">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
          <tr>{columns.map(col => <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">Loading...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">{emptyMessage}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row._id || row.id || i} className="hover:bg-[var(--bg-secondary)] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-[var(--text-primary)]">{col.render ? col.render(row) : (row[col.key] ?? '—')}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}