import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--sidebar-hover)]"><HiChevronLeft className="w-4 h-4" /></button>
      <div className="flex gap-1">
        {pages.map((p, i) => p === '...' ? <span key={`dots-${i}`} className="px-2 py-1 text-[var(--text-muted)] text-sm">...</span> :
          <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-fuchsia-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{p}</button>
        )}
      </div>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--sidebar-hover)]"><HiChevronRight className="w-4 h-4" /></button>
    </div>
  );
}