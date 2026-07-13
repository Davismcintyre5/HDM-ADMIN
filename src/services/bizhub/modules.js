import api from './api';

export async function getTenantModules(tenantId) {
  const res = await api.get(`/modules/tenant/${tenantId}`);
  return res.data;
}

export async function enableModule(tenantId, moduleName) {
  const res = await api.post('/modules/enable', { tenantId, moduleName });
  return res.data;
}

export async function disableModule(tenantId, moduleName) {
  const res = await api.post('/modules/disable', { tenantId, moduleName });
  return res.data;
}

export async function updateModuleFeatures(tenantId, moduleName, features) {
  const res = await api.put('/modules/features', { tenantId, moduleName, features });
  return res.data;
}