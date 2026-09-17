const SYMBOLS = {
  KES: 'KSh',
  USD: '$',
  EUR: '€',
  GBP: '£',
  TZS: 'TSh',
  UGX: 'USh',
  NGN: '₦',
  GHS: '₵',
  RWF: 'FRw',
  BIF: 'FBu'
};

export function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

export function toMajor(amountMinor) {
  return (amountMinor || 0) / 100;
}

export function getCurrencySymbol(code) {
  return SYMBOLS[code] || code || '';
}

export function formatMoney(amountMinor, currency = 'KES') {
  const symbol = getCurrencySymbol(currency);
  const major = toMajor(amountMinor);
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol} ${formatted}`;
}

export function formatPrice(amountMinor) {
  const major = toMajor(amountMinor);
  return major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default {
  toMinor,
  toMajor,
  getCurrencySymbol,
  formatMoney,
  formatPrice
};