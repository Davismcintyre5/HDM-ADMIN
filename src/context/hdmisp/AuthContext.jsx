import {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from 'react';
import { setAuthToken, setupInterceptors } from '../../services/hdmisp/api';
import {
  login as loginApi,
  logout as logoutApi,
  me as meApi,
  refresh as refreshApi,
} from '../../services/hdmisp/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hdmisp_token';
const REFRESH_KEY = 'hdmisp_refresh_token';
const ADMIN_KEY = 'hdmisp_admin';

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
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null
  );
  const [status, setStatus] = useState('idle'); // idle | loading | authenticated | unauthenticated
  const [error, setError] = useState(null);

  const refreshingRef = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAccessToken(null);
    setAdmin(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  }, []);

  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // Register interceptors once
  useEffect(() => {
    setupInterceptors({
      getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
      onTokenRefreshed: ({ accessToken: newAccess, refreshToken: newRefresh, admin: newAdmin }) => {
        if (newAccess) {
          localStorage.setItem(TOKEN_KEY, newAccess);
          setAccessToken(newAccess);
        }
        if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
        if (newAdmin) {
          localStorage.setItem(ADMIN_KEY, JSON.stringify(newAdmin));
          setAdmin(newAdmin);
        }
      },
      onUnauthorized: () => {
        clearSession();
        if (window.location.pathname !== '/hdmisp/login') {
          window.location.href = '/hdmisp/login';
        }
      },
    });
  }, [clearSession]);

  const persistSession = useCallback((data) => {
    const access = data?.accessToken || data?.token;
    const refresh = data?.refreshToken;
    const adminData = data?.admin || data?.user || data;

    if (access) {
      localStorage.setItem(TOKEN_KEY, access);
      setAccessToken(access);
      setAuthToken(access);
    }
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    if (adminData) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
      setAdmin(adminData);
    }
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (email, password) => {
      setStatus('loading');
      setError(null);
      try {
        const data = await loginApi(email, password);
        persistSession(data);
        return data;
      } catch (err) {
        const msg = err?.message || 'Login failed';
        setError(msg);
        setStatus('unauthenticated');
        throw err;
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return refreshingRef.current;
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) {
      clearSession();
      throw new Error('No refresh token');
    }
    refreshingRef.current = (async () => {
      try {
        const data = await refreshApi(rt);
        persistSession(data);
        return data;
      } finally {
        refreshingRef.current = null;
      }
    })();
    return refreshingRef.current;
  }, [persistSession, clearSession]);

  const hydrate = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    const at = localStorage.getItem(TOKEN_KEY);
    if (!rt && !at) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      const cached = readJSON(ADMIN_KEY);
      if (cached) setAdmin(cached);

      if (rt) {
        try {
          const refreshed = await refreshApi(rt);
          persistSession(refreshed);
        } catch {
          clearSession();
          return;
        }
      }

      try {
        const meRes = await meApi();
        if (meRes) {
          localStorage.setItem(ADMIN_KEY, JSON.stringify(meRes));
          setAdmin(meRes);
        }
      } catch {
        /* keep cached admin */
      }

      setStatus('authenticated');
    } catch {
      clearSession();
    }
  }, [persistSession, clearSession]);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    admin,
    accessToken,
    status,
    error,
    isAuthenticated: status === 'authenticated' && !!accessToken,
    loading: status === 'idle' || status === 'loading',
    isSuperadmin: admin?.adminRole === 'superadmin',
    isSupport: admin?.adminRole === 'support',
    login,
    logout,
    refresh,
    hydrate,
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