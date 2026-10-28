const SYMBOLS = { KES: 'KES', USD: '$', EUR: '€', GBP: '£', NGN: '₦', ZAR: 'R', UGX: 'USh', TZS: 'TSh' };

export function formatMoneyMajor(amount, currency = 'KES') {
  const n = Number(amount || 0);
  const sym = SYMBOLS[currency] || `${currency} `;
  const formatted = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${sym} ${formatted}`.trim();
}

export function formatMoneyMinor(minor, currency = 'KES') {
  return formatMoneyMajor(Number(minor || 0) / 100, currency);
}