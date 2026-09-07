export default function Avatar({ src, name, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center shrink-0`}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-[var(--text-secondary)]">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}