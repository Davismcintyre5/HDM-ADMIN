import { forwardRef } from 'react';

/**
 * Button
 *
 * Props:
 *  - variant   'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'outline' | 'ghost'
 *  - size      'sm' | 'md' | 'lg'
 *  - icon      ReactNode   — rendered before children (or centered if no children)
 *  - fullWidth boolean     — stretches to container width
 *  - loading   boolean     — shows spinner, disables button
 *  - disabled  boolean
 *  - children  ReactNode
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled = false,
    icon,
    fullWidth = false,
    type = 'button',
    ...props
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:ring-cyan-500',
    ghost: 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Icon-only buttons (icon passed but no children) collapse their padding
  // so they stay square-ish rather than stretching to the label width.
  const iconOnly = icon && (children === undefined || children === null || children === false || children === '');
  const iconOnlyPadding = iconOnly
    ? { sm: 'p-1.5', md: 'p-2', lg: 'p-3' }[size]
    : null;

  const classes = [
    base,
    variants[variant] || variants.primary,
    iconOnly ? iconOnlyPadding : sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon && <span className="shrink-0 inline-flex items-center">{icon}</span>
      )}
      {!iconOnly && children}
    </button>
  );
});

export default Button;