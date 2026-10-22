import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCompany } from '../../services/portfolio/company';

const HdmContext = createContext(null);

export function HdmProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompany();
      setCompany(res?.data || res || null);
    } catch (err) {
      setError(err?.message || 'Failed to load company');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <HdmContext.Provider value={{ company, loading, error, refresh }}>
      {children}
    </HdmContext.Provider>
  );
}

export function useHdm() {
  const ctx = useContext(HdmContext);
  if (!ctx) throw new Error('useHdm must be used within HdmProvider');
  return ctx;
}