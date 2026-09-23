const LOCALE = 'en-KE';

export function formatDate(input, style = 'short') {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return 'Invalid date';

  if (style === 'long') {
    return date.toLocaleDateString(LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(LOCALE);
}

export function formatTime(input) {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(input) {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function relativeTime(input) {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const s = Math.floor(diffMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (s < 60) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return formatDate(date);
}

export function toISO(input) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toISOString();
}

export function isToday(input) {
  if (!input) return false;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function startOfDay(input) {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(input) {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}