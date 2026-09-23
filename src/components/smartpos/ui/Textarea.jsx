import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', rows = 4, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y ${
          error ? 'border-red-500' : 'border-[var(--border-color)]'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
});

export default Textarea;