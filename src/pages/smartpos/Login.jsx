import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../context/smartpos/AuthContext';
import { useToast } from '../../context/smartpos/ToastContext';
import Input from '../../components/smartpos/ui/Input';
import Button from '../../components/smartpos/ui/Button';
import Card from '../../components/smartpos/ui/Card';
import Spinner from '../../components/smartpos/ui/Spinner';

export default function Login() {
  const { login, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/smartpos" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/smartpos');
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              S
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            SmartPOS Admin
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Super admin access only
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
            placeholder="admin@smartpos.co.ke"
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
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}