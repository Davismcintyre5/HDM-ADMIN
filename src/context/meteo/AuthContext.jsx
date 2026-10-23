import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  login as loginApi,
  logout as logoutApi,
  me as meApi,
  setAuthToken,
  setupInterceptors,
} from '../../services/meteo';

const AuthContext = createContext(null);

const TOKEN_KEY = 'meteo_token';
const ADMIN_KEY = 'meteo_admin';

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
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  }, []);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setupInterceptors({
      onUnauthorized: () => {
        clearSession();
        if (window.location.pathname !== '/meteo/login') {
          window.location.href = '/meteo/login';
        }
      },
    });
  }, [clearSession]);

  const persistSession = useCallback((data) => {
    const t = data.token || data.accessToken;
    const a = data.admin || data.user;
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
        setError(err.message || 'Login failed');
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

  const hydrate = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    setAuthToken(stored);
    try {
      const res = await meApi();
      const me = res?.data?.admin || res?.admin || res?.data || res;
      if (me) {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(me));
        setAdmin(me);
      }
      setStatus('authenticated');
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    admin,
    token,
    status,
    error,
    isAuthenticated: status === 'authenticated' && !!token,
    loading: status === 'idle' || status === 'loading',
    isSuperAdmin: admin?.role === 'super_admin',
    login,
    logout,
    hydrate,
    clearSession,
    setAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;