import api from './api';

export async function getSetting(key) {
  const res = await api.get(`/admin/system/${key}`);
  return res.data;
}

export async function updateSetting(key, value) {
  const res = await api.put(`/admin/system/${key}`, { value });
  return res.data;
}

export async function getAllSettings() {
  const keys = [
    'system_name',
    'terms_and_conditions',
    'privacy_policy',
    'support_email',
    'support_phone',
    'payments_mpesa_enabled',
    'payments_mpesa_stk_push',
    'payments_mpesa_send_money_enabled',
    'payments_mpesa_send_money_number',
    'payments_mpesa_paybill_enabled',
    'payments_mpesa_paybill_number',
    'payments_mpesa_paybill_account',
    'payments_mpesa_till_enabled',
    'payments_mpesa_till_number',
    'payments_mpesa_till_name',
    'payments_require_proof',
  ];
  const results = await Promise.all(
    keys.map(k => getSetting(k).catch(() => ({ key: k, value: '' })))
  );
  const settings = {};
  results.forEach(r => {
    settings[r.key] = r.value || '';
  });
  return { success: true, data: settings };
}