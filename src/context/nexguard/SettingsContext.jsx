import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings } from '../../services/nexguard/settings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(() => {
    setLoading(true);
    getSettings()
      .then(res => {
        const data = res?.data || res || {};
        setSettings(data);
        setCurrency(data.currency || 'USD');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const refreshSettings = () => fetchSettings();

  return (
    <SettingsContext.Provider value={{ settings, currency, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}