import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginApi,
  getProfile,
  setAuthToken,
  setupInterceptors,
} from '../../services/portfolio';

const AuthContext = createContext(null);

const TOKEN_KEY = 'portfolio_token';
const USER_KEY = 'portfolio_user';

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
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null
  );
  const [status, setStatus] = useState('idle'); // idle | loading | authenticated | unauthenticated

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setAuthToken(null);
  };

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setupInterceptors(() => {
      clearSession();
      if (window.location.pathname !== '/portfolio/login') {
        window.location.href = '/portfolio/login';
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    setAuthToken(stored);

    getProfile()
      .then((res) => {
        const profile = res?.data || res;
        if (profile) {
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
          setUser(profile);
        }
        setStatus('authenticated');
      })
      .catch(() => {
        clearSession();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const payload = data?.data || data;
    const t = payload?.token;
    const u = payload?.user;

    if (!t || !u) throw new Error('Invalid login response');

    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setAuthToken(t);
    setToken(t);
    setUser(u);
    setStatus('authenticated');
  };

  const logout = () => {
    clearSession();
    window.location.href = '/portfolio/login';
  };

  const value = {
    user,
    token,
    status,
    login,
    logout,
    isAuthenticated: status === 'authenticated' && !!token,
    loading: status === 'idle' || status === 'loading',
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}