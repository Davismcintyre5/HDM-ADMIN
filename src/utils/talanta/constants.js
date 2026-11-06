// src/utils/talanta/constants.js

export const PAGE_LIMIT = 20;

export const TICKET_STATUSES = ['held', 'paid', 'used', 'void'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHODS = ['mpesa', 'card', 'bank'];
export const MATCH_STATUSES = ['scheduled', 'sale_open', 'sold_out', 'closed'];
export const TIERS = ['regular', 'mid', 'premium'];
export const DELIVERY_CHANNELS = ['SMS', 'email'];

export const statusVariant = (status) => {
  switch (status) {
    case 'paid':
    case 'used':
    case 'sale_open':
    case 'active':
    case 'confirmed':
      return 'success';
    case 'held':
    case 'pending':
    case 'scheduled':
      return 'warning';
    case 'void':
    case 'failed':
    case 'closed':
      return 'danger';
    case 'refunded':
    case 'sold_out':
      return 'info';
    default:
      return 'default';
  }
};

export const statusLabel = (status) => {
  if (!status) return '—';
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatTicketStatus = (status) => {
  const map = { held: 'Held', paid: 'Paid', used: 'Used', void: 'Void' };
  return map[status] || statusLabel(status);
};

export const formatPaymentStatus = (status) => {
  const map = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return map[status] || statusLabel(status);
};

export const formatMatchStatus = (status) => {
  const map = {
    scheduled: 'Scheduled',
    sale_open: 'Sale Open',
    sold_out: 'Sold Out',
    closed: 'Closed',
  };
  return map[status] || statusLabel(status);
};

export const formatMethod = (method) => {
  const map = { mpesa: 'M-Pesa', card: 'Card', bank: 'Bank Transfer' };
  return map[method] || statusLabel(method);
};

export const formatTier = (tier) => {
  const map = { regular: 'Regular', mid: 'Mid', premium: 'Premium' };
  return map[tier] || statusLabel(tier);
};