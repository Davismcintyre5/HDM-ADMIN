import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/portfolio/AuthContext';
import { useToast } from '../../context/portfolio/ToastContext';
import Input from '../../components/portfolio/ui/Input';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import { HiArrowLeft } from 'react-icons/hi';

export default function Login() {
  const { login, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/portfolio';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <HiArrowLeft className="w-5 h-5" /> Return Home
      </Link>

      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-color)] p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              P
            </span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            HDM Portfolio
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Admin Panel
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hdm.co.ke"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}