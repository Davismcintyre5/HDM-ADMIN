// src/context/talanta/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, me as meApi, setAuthToken, setupInterceptors } from '../../services/talanta';

const AuthContext = createContext(null);

const TOKEN_KEY = 'talanta_token';
const ADMIN_KEY = 'talanta_admin';

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => readJSON(ADMIN_KEY));
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [status, setStatus] = useState('idle'); // idle | loading | authenticated | unauthenticated
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  }, []);

  // Keep the axios instance in sync with token state.
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Register 401 interceptor once.
  useEffect(() => {
    setupInterceptors(() => {
      clearSession();
      if (window.location.pathname !== '/talanta/login') {
        window.location.href = '/talanta/login';
      }
    });
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await loginApi(email, password);
      const t = data?.token || data?.accessToken;
      const a = data?.admin || data;

      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
        setToken(t);
        setAuthToken(t);
      }
      if (a) {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(a));
        setAdmin(a);
      }
      setStatus('authenticated');
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      setStatus('unauthenticated');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Hydrate from storage on mount.
  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setStatus('unauthenticated');
        return;
      }
      setStatus('loading');
      setAuthToken(stored);
      try {
        const res = await meApi();
        const a = res?.admin || res;
        if (a) {
          localStorage.setItem(ADMIN_KEY, JSON.stringify(a));
          setAdmin(a);
        }
        setStatus('authenticated');
      } catch {
        clearSession();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    admin,
    token,
    status,
    error,
    isAuthenticated: status === 'authenticated' && !!token,
    loading: status === 'idle' || status === 'loading',
    login,
    logout,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;