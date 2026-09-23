const SYMBOLS = {
  KES: 'KSh',
  USD: '$',
  EUR: '€',
  GBP: '£',
  TZS: 'TSh',
  UGX: 'USh',
  NGN: '₦',
  GHS: '₵',
  ZAR: 'R',
  RWF: 'FRw',
  BIF: 'FBu',
};

// Currencies that conventionally don't show decimals
const NO_DECIMAL = new Set(['KES', 'UGX', 'TZS', 'NGN', 'GHS', 'RWF', 'BIF']);

export function getCurrencySymbol(code) {
  return SYMBOLS[code] || code || '';
}

export function toMinor(amount) {
  return Math.round(Number(amount || 0) * 100);
}

export function toMajor(amountMinor) {
  return Number(amountMinor || 0) / 100;
}

// Value is in MINOR units (cents). Default for amountMinor fields.
export function formatMoney(amountMinor, currency = 'KES') {
  const symbol = getCurrencySymbol(currency);
  const major = toMajor(amountMinor);
  const noDecimals = NO_DECIMAL.has(currency);

  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  });

  return `${symbol} ${formatted}`;
}

// Value is in MAJOR units (whole shillings/dollars). Use for invoice totals.
export function formatMoneyMajor(amount, currency = 'KES') {
  const symbol = getCurrencySymbol(currency);
  const n = Number(amount || 0);
  const noDecimals = NO_DECIMAL.has(currency);

  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  });

  return `${symbol} ${formatted}`;
}

// Plain number, no symbol. Useful in tables.
export function formatPrice(amountMinor) {
  return toMajor(amountMinor).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default {
  toMinor,
  toMajor,
  getCurrencySymbol,
  formatMoney,
  formatMoneyMajor,
  formatPrice,
};