import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/farmvexa/AuthContext';
import Input from '../../components/farmvexa/ui/Input';
import Button from '../../components/farmvexa/ui/Button';
import Card from '../../components/farmvexa/ui/Card';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { HiGlobe, HiArrowLeft } from 'react-icons/hi';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"><Spinner size="lg" /></div>;
  if (isAuthenticated) return <Navigate to="/farmvexa" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try { await login(email, password); navigate('/farmvexa'); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Login failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4 transition-colors duration-200 relative">
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <HiArrowLeft className="w-4 h-4" /> Return Home
      </Link>
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <HiGlobe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">FarmVexa Admin</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI-Powered Farm Intelligence</p>
        </div>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@farmvexa.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          <Button type="submit" loading={submitting} className="w-full" size="lg">Sign In</Button>
        </form>
      </Card>
    </div>
  );
}