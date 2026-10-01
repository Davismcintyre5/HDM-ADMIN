import { forwardRef } from 'react';

const Select = forwardRef(({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    error,
    hint,
    required = false,
    className = '',
    name,
    ...rest
}, ref) => {
    const selectId = name || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-3 py-2 pr-9 rounded-lg border text-sm
                        bg-[var(--bg-primary)] text-[var(--text-primary)]
                        border-[var(--border-color)]
                        transition-colors appearance-none
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
                    `}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Chevron icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
            {!error && hint && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;