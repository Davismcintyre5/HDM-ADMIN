import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, refreshToken, setAuthToken, setupInterceptors } from '../../services/vibe';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vibe_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('vibe_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(
      async () => {
        const res = await refreshToken();
        localStorage.setItem('vibe_token', res.data.accessToken);
        setToken(res.data.accessToken);
        setAuthToken(res.data.accessToken);
        return res.data.accessToken;
      },
      () => {
        localStorage.removeItem('vibe_token');
        localStorage.removeItem('vibe_admin');
        setToken(null);
        setAdmin(null);
        window.location.href = '/vibe/login';
      }
    );
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const adminData = data.data?.user || data.user;
    localStorage.setItem('vibe_token', data.data?.accessToken || data.accessToken);
    localStorage.setItem('vibe_admin', JSON.stringify(adminData));
    setAuthToken(data.data?.accessToken || data.accessToken);
    setToken(data.data?.accessToken || data.accessToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_admin');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}