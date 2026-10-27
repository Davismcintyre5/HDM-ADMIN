import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { HiArrowLeft, HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../context/tvetgrid/AuthContext';
import { useToast } from '../../context/tvetgrid/ToastContext';
import Input from '../../components/tvetgrid/ui/Input';
import Button from '../../components/tvetgrid/ui/Button';
import Card from '../../components/tvetgrid/ui/Card';
import Spinner from '../../components/tvetgrid/ui/Spinner';

export default function Login() {
  const { login, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/tvetgrid';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
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
        <HiArrowLeft className="w-4 h-4" /> Return Home
      </Link>

      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white mb-4">
            <HiAcademicCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            TVETGrid
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Admin access only
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tvetgrid.co.ke"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Sign In
          </Button>
        </form>

        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          Admin-only access. Students and teachers use the mobile app.
        </p>
      </Card>
    </div>
  );
}