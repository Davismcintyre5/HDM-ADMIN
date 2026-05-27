import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, refreshAccessToken, setAuthToken, setupInterceptors } from '../../services/vault';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vault_admin')); } catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem('vault_access_token') || null);
  const [refreshTokenState, setRefreshTokenState] = useState(localStorage.getItem('vault_refresh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    setupInterceptors(
      async () => {
        const stored = localStorage.getItem('vault_refresh_token');
        if (!stored) throw new Error('No refresh token');
        const data = await refreshAccessToken(stored);
        localStorage.setItem('vault_access_token', data.accessToken);
        localStorage.setItem('vault_refresh_token', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshTokenState(data.refreshToken);
        setAuthToken(data.accessToken);
        return data.accessToken;
      },
      () => {
        localStorage.removeItem('vault_access_token');
        localStorage.removeItem('vault_refresh_token');
        localStorage.removeItem('vault_admin');
        setAccessToken(null);
        setRefreshTokenState(null);
        setAdmin(null);
        window.location.href = '/hdmvault/login';
      }
    );
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const adminData = {
      id: data.admin?.id,
      email: data.admin?.email,
      fullName: data.admin?.fullName,
      role: data.admin?.role,
    };
    localStorage.setItem('vault_access_token', data.accessToken);
    localStorage.setItem('vault_refresh_token', data.refreshToken);
    localStorage.setItem('vault_admin', JSON.stringify(adminData));
    setAuthToken(data.accessToken);
    setAccessToken(data.accessToken);
    setRefreshTokenState(data.refreshToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('vault_access_token');
    localStorage.removeItem('vault_refresh_token');
    localStorage.removeItem('vault_admin');
    setAccessToken(null);
    setRefreshTokenState(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      admin, token: accessToken, refreshToken: refreshTokenState,
      login, logout, isAuthenticated: !!accessToken, loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}