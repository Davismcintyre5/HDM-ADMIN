import api, { get, post, setAuthToken, unwrap } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const body = res?.data?.data || res?.data;
  if (!body?.accessToken) throw new Error('Login response missing accessToken');
  setAuthToken(body.accessToken);
  return body; // { accessToken, refreshToken, admin }
}

export async function refresh(refreshToken) {
  const res = await api.post('/auth/refresh', { refreshToken });
  const body = res?.data?.data || res?.data;
  if (!body?.accessToken) throw new Error('Refresh response missing accessToken');
  return body;
}

export async function me() {
  const { data } = await get('/auth/me');
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await post('/auth/change-password', { currentPassword, newPassword });
  return data;
}

export async function logout() {
  try {
    const { data } = await post('/auth/logout');
    return data;
  } catch {
    return { loggedOut: true };
  } finally {
    setAuthToken(null);
  }
}

export { setAuthToken };
export default { login, refresh, me, changePassword, logout };