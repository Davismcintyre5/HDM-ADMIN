import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
  me as meApi,
  setAuthToken,
  setupInterceptors,
} from '../../services/smartpos';

const AuthContext = createContext(null);

const TOKEN_KEY = 'smartpos_token';
const REFRESH_KEY = 'smartpos_refresh_token';
const ADMIN_KEY = 'smartpos_admin';

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

  // Push current access token into the axios instance whenever it changes
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAccessToken(null);
    setAdmin(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  }, []);

  // Register interceptors once
  useEffect(() => {
    setupInterceptors({
      getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
      onTokenRefreshed: ({ accessToken: newAccess, refreshToken: newRefresh }) => {
        if (newAccess) {
          localStorage.setItem(TOKEN_KEY, newAccess);
          setAccessToken(newAccess);
        }
        if (newRefresh) {
          localStorage.setItem(REFRESH_KEY, newRefresh);
        }
      },
      onUnauthorized: () => {
        clearSession();
        if (window.location.pathname !== '/smartpos/login') {
          window.location.href = '/smartpos/login';
        }
      },
    });
  }, [clearSession]);

  const persistSession = useCallback((data) => {
    const access = data.accessToken || data.token;
    const refresh = data.refreshToken;
    const adminData = data.admin || data.user || data;

    if (access) {
      localStorage.setItem(TOKEN_KEY, access);
      setAccessToken(access);
      setAuthToken(access);
    }
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);

    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (email, password) => {
      setStatus('loading');
      setError(null);
      try {
        const data = await loginApi(email, password);
        const payload = data?.data || data;
        persistSession(payload);
        return payload;
      } catch (err) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Login failed';
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
      /* ignore — we clear locally either way */
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
        const payload = data?.data || data;
        persistSession(payload);
        return payload;
      } finally {
        refreshingRef.current = null;
      }
    })();

    return refreshingRef.current;
  }, [persistSession, clearSession]);

  const hydrate = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      const cached = readJSON(ADMIN_KEY);
      if (cached) setAdmin(cached);

      const refreshed = await refreshApi(rt);
      const payload = refreshed?.data || refreshed;
      persistSession(payload);

      try {
        const meRes = await meApi();
        const me = meRes?.data || meRes;
        if (me) {
          localStorage.setItem(ADMIN_KEY, JSON.stringify(me));
          setAdmin(me);
        }
      } catch {
        /* /me failed — keep cached admin */
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