import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--border-color)] max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}