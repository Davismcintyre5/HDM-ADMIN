import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    className = '',
    id,
    rows = 4,
    resize = 'vertical',
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        style={{ resize }}
        className={`w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-[var(--border-color)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
        {...props}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>
      )}
    </div>
  );
});

export default Textarea;