import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder, className = '', ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-[var(--border-color)]'
        } ${className}`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;