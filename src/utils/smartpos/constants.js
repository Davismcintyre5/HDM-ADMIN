export const ROUTES = {
  login: '/smartpos/login',
  dashboard: '/smartpos',
  clients: '/smartpos/clients',
  clientDetail: (id) => `/smartpos/clients/${id}`,
  pending: '/smartpos/pending',
  pendingDetail: (id) => `/smartpos/pending/${id}`,
  plans: '/smartpos/plans',
  paymentMethods: '/smartpos/payment-methods',
  settings: '/smartpos/settings',
  legal: '/smartpos/legal',
  legalEditor: (type, version) =>
    version
      ? `/smartpos/legal/${type}/${version}`
      : `/smartpos/legal/${type}/new`,
  backups: '/smartpos/backups',
  aiUsage: '/smartpos/ai-usage',
  audit: '/smartpos/audit',
  health: '/smartpos/health',
  profile: '/smartpos/profile',
  forbidden: '/smartpos/403',
};

export const CLIENT_STATUS = {
  PENDING_USER: 'pending_user',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
};

export const CLIENT_STATUS_LIST = Object.values(CLIENT_STATUS);

export const PENDING_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

export const PENDING_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
};

export const BUSINESS_TYPE = {
  RETAIL: 'retail',
  RESTAURANT: 'restaurant',
  SALON: 'salon',
  PHARMACY: 'pharmacy',
  COSMETICS: 'cosmetics',
  OTHER: 'other',
};

export const BACKUP_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

export const BACKUP_TYPE = {
  MANUAL: 'manual',
  AUTO: 'auto',
};

export const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund', 'aup'];

export const PAYMENT_CODES = [
  'stripe',
  'mpesa_stk',
  'cash',
  'mpesa_send',
  'mpesa_till',
  'mpesa_paybill',
  'bank',
];

export const AI_TYPES = {
  SUMMARIZE: 'summarize',
  CHAT: 'chat',
  FORECAST: 'forecast',
  ANOMALY: 'anomaly',
  STOCK: 'stock',
  PUBLIC_CHAT: 'public_chat',
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
  READ_ONLY: 'read_only',
};

export const DEFAULT_PAGE_SIZE = 20;
export const TOAST_DURATION = 4000;

// Status → Badge variant map, used across list pages
export const STATUS_VARIANT = {
  active: 'success',
  pending_user: 'warning',
  pending: 'warning',
  in_review: 'info',
  rejected: 'danger',
  suspended: 'danger',
  expired: 'neutral',
  success: 'success',
  running: 'warning',
  failed: 'danger',
  paid: 'success',
  unpaid: 'warning',
  sent: 'info',
  overdue: 'danger',
};

export function statusVariant(status) {
  return STATUS_VARIANT[status] || 'neutral';
}