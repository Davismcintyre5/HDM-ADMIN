import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/bizhub/AuthContext';
import Input from '../../components/bizhub/ui/Input';
import Button from '../../components/bizhub/ui/Button';
import { HiArrowLeft } from 'react-icons/hi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/bizhub';
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
    setLoading(true); setServerError('');
    try { await login(form.email.trim(), form.password); navigate(from, { replace: true }); }
    catch (err) { setServerError(err?.response?.data?.message || err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <HiArrowLeft className="w-5 h-5" /> Return Home
      </Link>
      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-color)] p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">BizHub Kenya</h1>
          <p className="text-[var(--text-secondary)] text-sm">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@bizhub.ke" />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
          {serverError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{serverError}</div>}
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}