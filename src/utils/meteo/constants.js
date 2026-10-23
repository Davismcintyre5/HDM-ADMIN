export const ROUTES = {
  login: '/meteo/login',
  dashboard: '/meteo',
  pending: '/meteo/pending',
  pendingDetail: (id) => `/meteo/pending/${id}`,
  tenants: '/meteo/tenants',
  tenantDetail: (id) => `/meteo/tenants/${id}`,
  users: '/meteo/users',
  userDetail: (id) => `/meteo/users/${id}`,
  plans: '/meteo/plans',
  invoices: '/meteo/invoices',
  invoiceDetail: (id) => `/meteo/invoices/${id}`,
  payments: '/meteo/payments',
  paymentDetail: (id) => `/meteo/payments/${id}`,
  settings: '/meteo/settings',
  paymentMethods: '/meteo/payment-methods',
  apiKeys: '/meteo/api-keys',
  backups: '/meteo/backups',
  health: '/meteo/health',
  admins: '/meteo/admins',
  profile: '/meteo/profile',
  forbidden: '/meteo/403',
};

export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const TENANT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
};

export const TENANT_STATUS_LIST = Object.values(TENANT_STATUS);

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILED: 'failed',
};

export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);

export const PAYMENT_TYPE = {
  PAYMENT: 'payment',
  REFUND: 'refund',
};

export const INVOICE_STATUS = {
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LIST = Object.values(INVOICE_STATUS);

export const PLAN_INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'once', label: 'One-time' },
];

export const PLAN_FEATURES = [
  { key: 'currentWeather', label: 'Current Weather' },
  { key: 'forecast', label: 'Forecast' },
  { key: 'aiSummary', label: 'AI Summary' },
  { key: 'historical', label: 'Historical Data' },
  { key: 'alerts', label: 'Weather Alerts' },
  { key: 'bulkLookup', label: 'Bulk Lookup' },
];

export const PAYMENT_METHOD_CODES = [
  'cash',
  'mpesa_stk',
  'mpesa_send',
  'mpesa_till',
  'mpesa_paybill',
  'bank',
  'stripe',
];

export const PAYMENT_METHOD_MODES = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

export const WEATHER_PROVIDERS = [
  { value: 'open_meteo', label: 'Open-Meteo' },
  { value: 'openweather', label: 'OpenWeather' },
  { value: 'weatherapi', label: 'WeatherAPI' },
];

export const API_KEY_SCOPES = [
  { value: 'current', label: 'Current Weather' },
  { value: 'forecast', label: 'Forecast' },
  { value: 'aiSummary', label: 'AI Summary' },
];

export const PENDING_TABS = [
  { key: 'registrations', label: 'Registrations' },
  { key: 'renewals', label: 'Renewals' },
  { key: 'upgrades', label: 'Upgrades' },
];

export const DEFAULT_PAGE_SIZE = 20;

export const STATUS_VARIANT = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  success: 'success',
  failed: 'danger',
  paid: 'success',
  sent: 'info',
  overdue: 'danger',
  cancelled: 'default',
  refund: 'info',
  payment: 'success',
  enabled: 'success',
  disabled: 'default',
  up: 'success',
  down: 'danger',
  connected: 'success',
  healthy: 'success',
  unhealthy: 'danger',
  degraded: 'warning',
};

export function statusVariant(status) {
  return STATUS_VARIANT[status] || 'neutral';
}

export function statusLabel(status) {
  if (!status) return '—';
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}