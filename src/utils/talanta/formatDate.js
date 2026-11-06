// src/utils/talanta/formatDate.js

const pad = (n) => String(n).padStart(2, '0');

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const relativeTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (abs < min) return 'just now';
  if (abs < hour) return `${Math.floor(abs / min)}m ago`;
  if (abs < day) return `${Math.floor(abs / hour)}h ago`;
  if (abs < week) return `${Math.floor(abs / day)}d ago`;
  if (abs < month) return `${Math.floor(abs / week)}w ago`;
  if (abs < year) return `${Math.floor(abs / month)}mo ago`;
  return `${Math.floor(abs / year)}y ago`;
};

export const formatCountdown = (target) => {
  if (!target) return null;
  const d = new Date(target);
  if (isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

export const toISODate = (d) => {
  const dd = d instanceof Date ? d : new Date(d);
  if (isNaN(dd.getTime())) return '';
  return `${dd.getFullYear()}-${pad(dd.getMonth() + 1)}-${pad(dd.getDate())}`;
};

export const toISODateTimeLocal = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};