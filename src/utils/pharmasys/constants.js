export const ROUTES = {
  login: '/pharmasys/login',
  dashboard: '/pharmasys',
  tenants: '/pharmasys/tenants',
  tenantDetail: (id) => `/pharmasys/tenants/${id}`,
  pending: '/pharmasys/pending',
  pendingDetail: (id) => `/pharmasys/pending/${id}`,
  plans: '/pharmasys/plans',
  payments: '/pharmasys/payments',
  paymentDetail: (id) => `/pharmasys/payments/${id}`,
  invoices: '/pharmasys/invoices',
  invoiceDetail: (id) => `/pharmasys/invoices/${id}`,
  paymentMethods: '/pharmasys/payment-methods',
  settings: '/pharmasys/settings',
  audit: '/pharmasys/audit-logs',
  backups: '/pharmasys/backups',
  legal: '/pharmasys/legal',
  legalEditor: (type) => `/pharmasys/legal/${type}`,
  health: '/pharmasys/health',
  profile: '/pharmasys/profile',
  forbidden: '/pharmasys/403',
};

export const TENANT_STATUS = {
  PENDING_USER: 'pending_user',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
};

export const TENANT_STATUS_LIST = Object.values(TENANT_STATUS);

export const PENDING_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);

export const PAYMENT_METHODS = [
  'mpesa_stk',
  'mpesa_till',
  'mpesa_paybill',
  'mpesa_send',
  'stripe',
  'cash',
  'bank',
];

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const BACKUP_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

export const BACKUP_FREQUENCIES = ['hourly', 'daily', 'weekly', 'monthly'];

export const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund', 'aup'];

export const AI_FEATURES = [
  'landingAi',
  'clientAi',
  'fileUpload',
  'outwardApiKeys',
];

export const PLAN_INTERVALS = [
  { value: 'once', label: 'One-time' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Annual' },
];

export const PLAN_FEATURES = [
  { key: 'aiInsights', label: 'AI Insights' },
  { key: 'multiBranch', label: 'Multi-Branch' },
  { key: 'api', label: 'API Access' },
  { key: 'prioritySupport', label: 'Priority Support' },
  { key: 'customDomain', label: 'Custom Domain' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'interactionCheck', label: 'Drug Interaction Check' },
];

export const PLAN_LIMITS = [
  { key: 'maxOwners', label: 'Max owners', hint: '0 = unlimited' },
  { key: 'maxBranches', label: 'Max branches', hint: '0 = unlimited' },
  { key: 'maxManagersPerBranch', label: 'Max managers per branch' },
  { key: 'maxCashiersPerBranch', label: 'Max cashiers per branch' },
  { key: 'maxProducts', label: 'Max products' },
  { key: 'maxTransactionsPerMonth', label: 'Transactions / month', hint: '0 = unlimited' },
  { key: 'maxAiCallsPerDay', label: 'AI calls / day' },
  { key: 'maxSmsPerMonth', label: 'SMS / month' },
];

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
  READ_ONLY: 'read_only',
};

export const DEFAULT_PAGE_SIZE = 20;
export const TOAST_DURATION = 4000;

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
  draft: 'neutral',
  cancelled: 'neutral',
  refunded: 'info',
};

export function statusVariant(status) {
  return STATUS_VARIANT[status] || 'neutral';
}

export function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}