/* ------------------------------------------------------------------ */
/* Status enums (match backend exactly)                               */
/* ------------------------------------------------------------------ */

export const PENDING_STATUS_LIST = [
  'unverified',
  'verified',
  'awaiting_payment',
  'awaiting_approval',
  'approved',
  'rejected',
  'expired',
];

export const PROVIDER_STATUS_LIST = ['active', 'suspended', 'rejected'];

export const TRANSACTION_STATUS_LIST = ['pending', 'completed', 'failed', 'cancelled'];

export const LEGAL_TYPES = ['terms', 'privacy', 'refund', 'aup'];

export const ADMIN_ROLES = ['superadmin', 'support'];

export const BILLING_CYCLES = ['monthly', 'yearly', 'quarterly', 'once'];

export const PAYMENT_METHOD_CODES = [
  'mpesa_stk',
  'mpesa_send',
  'mpesa_till',
  'mpesa_paybill',
  'bank',
  'cash',
  'stripe',
  'paypal',
];

/* ------------------------------------------------------------------ */
/* Labels + variants                                                 */
/* ------------------------------------------------------------------ */

export function statusLabel(status) {
  if (!status) return '—';
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusVariant(status) {
  switch (status) {
    case 'active':
    case 'completed':
    case 'approved':
    case 'verified':
      return 'success';
    case 'pending':
    case 'unverified':
    case 'awaiting_payment':
    case 'awaiting_approval':
      return 'warning';
    case 'failed':
    case 'rejected':
    case 'suspended':
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'support':
      return 'info';
    case 'superadmin':
      return 'warning';
    default:
      return 'default';
  }
}

/* ------------------------------------------------------------------ */
/* Health                                                             */
/* ------------------------------------------------------------------ */

export const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'running', 'configured', 'ok'];
export const WARN_STATES = ['disabled', 'degraded', 'idle'];

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */

export const PAGE_LIMIT = 20;