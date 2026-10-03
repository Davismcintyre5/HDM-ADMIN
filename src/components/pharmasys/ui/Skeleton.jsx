export default function Skeleton({ className = 'h-4 w-full', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[var(--bg-tertiary)] rounded ${className}`}
        />
      ))}
    </>
  );
}