import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/spark/AuthContext';
import Input from '../../components/spark/ui/Input';
import Button from '../../components/spark/ui/Button';
import { validateEmail, validatePassword } from '../../utils/spark/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/spark';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { email: validateEmail(form.email), password: validatePassword(form.password) };
    if (Object.values(newErrors).some(Boolean)) { setErrors(newErrors); return; }
    setLoading(true); setServerError('');
    try { await login(form.email, form.password); navigate(from, { replace: true }); }
    catch (err) { setServerError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-color)] p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">Spark</h1>
          <p className="text-[var(--text-secondary)] text-sm">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="admin@spark.hdm.com" />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
          {serverError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{serverError}</div>}
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}