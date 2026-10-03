const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-[var(--border-color)] border-t-blue-600 animate-spin ${
        SIZES[size] || SIZES.md
      } ${className}`}
    />
  );
}