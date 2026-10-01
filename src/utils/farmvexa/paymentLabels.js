export const PAYMENT_CODE_LABELS = {
  mpesa_stk: 'M-Pesa STK Push',
  mpesa_send: 'M-Pesa Send Money',
  mpesa_send_money: 'M-Pesa Send Money',
  mpesa_till: 'M-Pesa Till',
  mpesa_paybill: 'M-Pesa Paybill',
  bank: 'Bank Transfer',
  cash: 'Cash',
  stripe: 'Card (Stripe)',
};

export const PAYMENT_PURPOSE_LABELS = {
  registration: 'Registration',
  renewal: 'Renewal',
  upgrade: 'Upgrade',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  success: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_VARIANTS = {
  pending: 'warning',
  success: 'success',
  failed: 'danger',
  cancelled: 'default',
};

export const APPROVAL_STATUS_VARIANTS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export const INVOICE_STATUS_VARIANTS = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  failed: 'danger',
  cancelled: 'default',
  expired: 'danger',
};

export const SUBSCRIPTION_STATUS_VARIANTS = {
  active: 'success',
  pending_renewal: 'warning',
  expired: 'danger',
  cancelled: 'warning',
};

export const methodLabel = (code) =>
  PAYMENT_CODE_LABELS[code] ||
  (code ? code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');

export const purposeLabel = (purpose) =>
  PAYMENT_PURPOSE_LABELS[purpose] || purpose || '—';

export const statusLabel = (status) =>
  PAYMENT_STATUS_LABELS[status] || status || '—';

export const statusVariant = (status) =>
  PAYMENT_STATUS_VARIANTS[status] || 'default';

export const deriveMode = (code) =>
  code === 'mpesa_stk' || code === 'stripe' ? 'auto' : 'manual';

export const buildEmptyMethodForm = () => ({
  code: 'mpesa_stk',
  label: 'M-Pesa STK Push',
  mode: 'auto',
  order: 0,
  enabled: true,
  config: {},
});

export const METHOD_CODE_OPTIONS = [
  { value: 'mpesa_stk', label: 'M-Pesa STK Push' },
  { value: 'mpesa_send_money', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'stripe', label: 'Card (Stripe)' },
];