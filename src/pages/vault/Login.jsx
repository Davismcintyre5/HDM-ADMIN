import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/vault/AuthContext';
import Input from '../../components/vault/ui/Input';
import Button from '../../components/vault/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/hdmvault';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) return;
    setLoading(true);
    setServerError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-color)] p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">HDM Vault</h1>
          <p className="text-[var(--text-secondary)] text-sm">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@example.com" autoComplete="email" />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
          {serverError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{serverError}</div>}
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}