import { forwardRef, useId } from 'react';
import { HiChevronDown } from 'react-icons/hi';

/**
 * Select — styled native <select> with optional label, hint, and error.
 *
 * Props:
 *  - label       string
 *  - hint        string
 *  - error       string
 *  - options     Array<{ value: string, label: string, disabled?: boolean }>
 *  - placeholder string     renders a disabled empty option when set
 *  - value       string
 *  - onChange    (e) => void
 *  - disabled    boolean
 *  - required    boolean
 *  - id          string     (auto-generated if omitted)
 *  - className   string     applied to the wrapper
 *  - selectClassName  string  applied to the <select> itself
 */
const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    options = [],
    placeholder,
    value = '',
    onChange,
    disabled = false,
    required = false,
    id,
    className = '',
    selectClassName = '',
    ...rest
  },
  ref
) {
  const autoId = useId();
  const selectId = id || `select-${autoId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const borderClass = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-[var(--border-color)] focus:ring-cyan-500 focus:border-cyan-500';

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={[
            'w-full appearance-none px-3 py-2 pr-9 rounded-lg text-sm',
            'bg-[var(--input-bg)] text-[var(--text-primary)]',
            'border focus:outline-none focus:ring-2',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'transition-colors',
            borderClass,
            selectClassName,
          ].join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <HiChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-[var(--text-muted)] mt-1">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Select;