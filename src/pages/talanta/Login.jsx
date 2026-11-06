// src/pages/talanta/Login.jsx
import { useState } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../context/talanta/AuthContext';
import { useToast } from '../../context/talanta/ToastContext';
import Input from '../../components/talanta/ui/Input';
import Button from '../../components/talanta/ui/Button';
import Card from '../../components/talanta/ui/Card';
import Spinner from '../../components/talanta/ui/Spinner';

export default function Login() {
  const { login, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/talanta';

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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 mb-4">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">T</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Talanta Sports City
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Admin panel
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
            placeholder="admin@talantasportscity.com"
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