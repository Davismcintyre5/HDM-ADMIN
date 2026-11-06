// src/utils/talanta/formatMoney.js

const CURRENCY_SYMBOLS = { KES: 'KSh', USD: '$', EUR: '€', GBP: '£', TZS: 'TSh', UGX: 'USh' };

const NO_DECIMALS = new Set(['KES', 'TZS', 'UGX', 'RWF']);

const symbolFor = (currency) => CURRENCY_SYMBOLS[currency] || (currency ? `${currency} ` : '');

export const formatMoney = (amount, currency = 'KES', options = {}) => {
  const { withDecimals } = options;
  const value = Number(amount || 0);
  const decimals = withDecimals
    ? 2
    : NO_DECIMALS.has(currency)
      ? 0
      : Number.isInteger(value)
        ? 0
        : 2;
  const formatted = value.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbolFor(currency)}${formatted}`;
};

// Major-unit formatter (amount assumed in major units, e.g. 2500 → "KSh 2,500")
export const formatMoneyMajor = (amount, currency = 'KES') => formatMoney(amount, currency);

// Minor-unit formatter (amount in cents, e.g. 250000 → "KSh 2,500")
export const formatMoneyMinor = (amount, currency = 'KES') =>
  formatMoney(Number(amount || 0) / 100, currency);

export const formatNumber = (n) => Number(n || 0).toLocaleString('en-KE');