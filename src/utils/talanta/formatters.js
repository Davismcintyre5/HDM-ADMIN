// src/utils/talanta/formatters.js

export const initials = (name = '') => {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('');
};

export const truncate = (value, max = 60) => {
  if (!value) return '';
  const s = String(value);
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

export const bytes = (n) => {
  const v = Number(n || 0);
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  if (v < 1024 * 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`;
  return `${(v / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const maskPhone = (phone) => {
  if (!phone) return '—';
  const s = String(phone);
  if (s.length < 8) return s;
  return `${s.slice(0, 3)}***${s.slice(-4)}`;
};

export const seatLabel = (seat) => {
  if (!seat) return '—';
  const parts = [seat.section, seat.row, seat.number].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
};