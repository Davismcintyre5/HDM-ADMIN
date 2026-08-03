import api from './api';

export async function getCountries() {
  const res = await api.get('/schools/reference/countries');
  return res.data;
}

export async function getCounties(countryCode) {
  const res = await api.get('/schools/reference/counties', { params: { country: countryCode } });
  return res.data;
}

export async function getConstituencies(countyCode) {
  const res = await api.get('/schools/reference/constituencies', { params: { county: countyCode } });
  return res.data;
}

export async function getWards(constituencyCode) {
  const res = await api.get('/schools/reference/wards', { params: { constituency: constituencyCode } });
  return res.data;
}