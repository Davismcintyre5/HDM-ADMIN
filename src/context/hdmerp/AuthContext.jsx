import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, refreshAccessToken, setAuthToken, setupInterceptors } from '../../services/hdmerp';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hdmerp_admin')); } catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem('hdmerp_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('hdmerp_refresh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
    }
    setupInterceptors(
      async () => {
        const stored = localStorage.getItem('hdmerp_refresh_token');
        if (!stored) throw new Error('No refresh token');
        const data = await refreshAccessToken(stored);
        localStorage.setItem('hdmerp_access_token', data.accessToken);
        setAccessToken(data.accessToken);
        return data.accessToken;
      },
      () => {
        localStorage.removeItem('hdmerp_access_token');
        localStorage.removeItem('hdmerp_refresh_token');
        localStorage.removeItem('hdmerp_admin');
        setAccessToken(null);
        setRefreshToken(null);
        setAdmin(null);
        window.location.href = '/hdmerp/login';
      }
    );
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('hdmerp_access_token', data.accessToken);
    localStorage.setItem('hdmerp_refresh_token', data.refreshToken);
    localStorage.setItem('hdmerp_admin', JSON.stringify(data.admin));
    setAuthToken(data.accessToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('hdmerp_access_token');
    localStorage.removeItem('hdmerp_refresh_token');
    localStorage.removeItem('hdmerp_admin');
    setAccessToken(null);
    setRefreshToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token: accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated: !!accessToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}