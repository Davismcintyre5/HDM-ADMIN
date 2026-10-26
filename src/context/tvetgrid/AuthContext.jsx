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
  me as meApi,
  refresh as refreshApi,
  setAuthToken,
  setupInterceptors,
} from '../../services/tvetgrid';

const AuthContext = createContext(null);

const ACCESS_KEY = 'tvetgrid_access';
const REFRESH_KEY = 'tvetgrid_refresh';
const USER_KEY = 'tvetgrid_user';

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(USER_KEY));
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_KEY) || null
  );
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const refreshingRef = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  }, []);

  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // Refresh the access token using the stored refresh token
  const refreshTokenFlow = useCallback(async () => {
    if (refreshingRef.current) return refreshingRef.current;

    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) {
      clearSession();
      throw new Error('No refresh token');
    }

    refreshingRef.current = (async () => {
      try {
        const res = await refreshApi(rt);
        const data = res?.data || res;
        const newAccess = data.accessToken;
        const newRefresh = data.refreshToken;

        if (!newAccess) throw new Error('Refresh returned no access token');

        localStorage.setItem(ACCESS_KEY, newAccess);
        if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
        setAccessToken(newAccess);
        setAuthToken(newAccess);

        return newAccess;
      } finally {
        refreshingRef.current = null;
      }
    })();

    return refreshingRef.current;
  }, [clearSession]);

  useEffect(() => {
    setupInterceptors({
      getAccessToken: () => localStorage.getItem(ACCESS_KEY),
      getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
      onRefresh: refreshTokenFlow,
      onRefreshSuccess: ({ accessToken: a, refreshToken: r }) => {
        if (a) {
          localStorage.setItem(ACCESS_KEY, a);
          setAccessToken(a);
        }
        if (r) localStorage.setItem(REFRESH_KEY, r);
      },
      onUnauthorized: () => {
        clearSession();
        if (window.location.pathname !== '/tvetgrid/login') {
          window.location.href = '/tvetgrid/login';
        }
      },
    });
  }, [refreshTokenFlow, clearSession]);

  const persistSession = useCallback((data) => {
    const access = data.accessToken || data.token;
    const refresh = data.refreshToken;
    const u = data.user || data.admin;

    if (!access) throw new Error('Login response missing access token');

    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));

    setAccessToken(access);
    setAuthToken(access);
    if (u) setUser(u);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (email, password) => {
      setStatus('loading');
      setError(null);
      try {
        const res = await loginApi(email, password);
        const payload = res?.data || res;
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
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!access && !refresh) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      // If we have a token, try /me
      if (access) setAuthToken(access);
      try {
        const res = await meApi();
        const u = res?.data || res;
        if (u) {
          localStorage.setItem(USER_KEY, JSON.stringify(u));
          setUser(u);
        }
        setStatus('authenticated');
        return;
      } catch {
        /* fall through to refresh */
      }

      // If /me failed and we have a refresh token, try refresh + retry
      if (refresh) {
        await refreshTokenFlow();
        const res = await meApi();
        const u = res?.data || res;
        if (u) {
          localStorage.setItem(USER_KEY, JSON.stringify(u));
          setUser(u);
        }
        setStatus('authenticated');
        return;
      }

      clearSession();
    } catch {
      clearSession();
    }
  }, [refreshTokenFlow, clearSession]);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    admin: user,
    accessToken,
    status,
    error,
    isAuthenticated: status === 'authenticated' && !!accessToken,
    loading: status === 'idle' || status === 'loading',
    login,
    logout,
    hydrate,
    refreshTokenFlow,
    clearSession,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;