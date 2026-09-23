export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export function titleCase(s) {
  return String(s || '')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function truncate(s, len, suffix = '…') {
  const str = String(s || '');
  return str.length > len ? str.slice(0, len) + suffix : str;
}

export function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function maskEmail(email) {
  const [user, domain] = String(email || '').split('@');
  if (!domain) return '[redacted]';
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone) {
  const s = String(phone || '');
  if (s.length < 6) return '[redacted]';
  return `${s.slice(0, 4)}***${s.slice(-2)}`;
}

export function bytes(n) {
  const num = Number(n || 0);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / 1024 / 1024).toFixed(2)} MB`;
  return `${(num / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function number(n, locale = 'en-KE') {
  return new Intl.NumberFormat(locale).format(Number(n || 0));
}

export function percent(n, digits = 1) {
  return `${Number(n || 0).toFixed(digits)}%`;
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}

export function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// "mobile_money" → "Mobile money"
export function humanizeKey(key) {
  return String(key || '')
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}