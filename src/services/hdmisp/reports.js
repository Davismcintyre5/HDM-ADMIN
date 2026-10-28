import { get } from './api';

export async function getReportsSummary() {
  const { data } = await get('/reports/summary');
  return data;
}

export async function getDailyReports(params = {}) {
  const { data, meta } = await get('/reports/daily', { params });
  return { data: data || [], meta };
}

export async function getProviderRevenue(params = {}) {
  const { data } = await get('/reports/provider-revenue', { params });
  return data || [];
}