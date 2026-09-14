const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  KES: 130,
  NGN: 1550,
  ZAR: 18.5,
  GHS: 15.5,
  TZS: 2650,
  UGX: 3750,
};

const NO_DECIMAL_CURRENCIES = ['KES', 'UGX', 'TZS', 'NGN', 'GHS'];

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '—';
  const num = Number(amount);
  const rate = EXCHANGE_RATES[currency] || 1;
  const converted = num * rate;

  if (NO_DECIMAL_CURRENCIES.includes(currency)) {
    return `${currency} ${Math.round(converted).toLocaleString()}`;
  }

  return `${currency} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}