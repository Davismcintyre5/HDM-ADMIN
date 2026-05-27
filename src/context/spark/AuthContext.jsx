import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, refreshToken, setAuthToken, setupInterceptors } from '../../services/spark';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spark_admin')); } catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem('spark_access_token') || null);
  const [refreshTokenState, setRefreshTokenState] = useState(localStorage.getItem('spark_refresh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    setupInterceptors(
      async () => {
        const stored = localStorage.getItem('spark_refresh_token');
        if (!stored) throw new Error('No refresh token');
        const data = await refreshToken(stored);
        localStorage.setItem('spark_access_token', data.accessToken);
        localStorage.setItem('spark_refresh_token', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshTokenState(data.refreshToken);
        return data.accessToken;
      },
      () => {
        localStorage.removeItem('spark_access_token');
        localStorage.removeItem('spark_refresh_token');
        localStorage.removeItem('spark_admin');
        setAccessToken(null);
        setRefreshTokenState(null);
        setAdmin(null);
        window.location.href = '/spark/login';
      }
    );
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const adminData = {
      id: data.admin?.adminId,
      name: data.admin?.displayName,
      email: data.admin?.email,
      role: data.admin?.role,
    };
    localStorage.setItem('spark_access_token', data.accessToken);
    localStorage.setItem('spark_refresh_token', data.refreshToken);
    localStorage.setItem('spark_admin', JSON.stringify(adminData));
    setAuthToken(data.accessToken);
    setAccessToken(data.accessToken);
    setRefreshTokenState(data.refreshToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('spark_access_token');
    localStorage.removeItem('spark_refresh_token');
    localStorage.removeItem('spark_admin');
    setAccessToken(null);
    setRefreshTokenState(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token: accessToken, refreshToken: refreshTokenState, login, logout, isAuthenticated: !!accessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}