import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

/**
 * Modal
 *
 * Props:
 *  - open     boolean
 *  - onClose  () => void
 *  - title    string | ReactNode
 *  - size     'sm' | 'md' | 'lg' | 'xl'
 *  - footer   ReactNode   — pinned to bottom, always visible
 *  - children ReactNode   — scrolls if it overflows
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  // Lock body scroll while open; restore on close/unmount.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`relative w-full ${sizes[size] || sizes.md} bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--border-color)] flex flex-col max-h-[90vh]`}
      >
        {/* Header — pinned */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-[var(--border-color)] shrink-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Close"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrolls independently */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {/* Footer — pinned, always visible */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 border-t border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-end gap-2 shrink-0 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}