import api from './api';

export async function getSmsWallets(params = {}) {
  const res = await api.get('/sms/wallets', { params });
  return res.data;
}

export async function getSmsWalletByOrg(orgId) {
  const res = await api.get(`/sms/wallets/${orgId}`);
  return res.data;
}

export async function grantSmsCredits(orgId, data) {
  const res = await api.post(`/sms/wallets/${orgId}/grant`, data);
  return res.data;
}

export async function getSmsMargin(params = {}) {
  const res = await api.get('/sms/margin', { params });
  return res.data;
}

export async function getSmsConfig() {
  const res = await api.get('/sms/config');
  return res.data;
}