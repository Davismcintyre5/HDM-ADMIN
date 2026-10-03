import { useState } from 'react';
import { HiKey, HiUser, HiMail, HiShieldCheck } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Button from '../../components/pharmasys/ui/Button';
import Input from '../../components/pharmasys/ui/Input';
import { useAuth } from '../../context/pharmasys/AuthContext';
import { useToast } from '../../context/pharmasys/ToastContext';
import { changePassword } from '../../services/pharmasys/auth';
import { initials } from '../../utils/pharmasys/formatters';
import { formatDateTime } from '../../utils/pharmasys/formatDate';

export default function Profile() {
  const { admin } = useAuth();
  const toast = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const name = admin?.fullName || admin?.name || 'Admin';
  const email = admin?.email || '—';
  const role = admin?.role === 'super_admin' ? 'Super admin' : admin?.role || 'Admin';

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!current || !next || !confirm) {
      toast.error('All fields are required');
      return;
    }

    if (next !== confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (next.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (next === current) {
      toast.error('New password must be different from current');
      return;
    }

    setBusy(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success('Password changed successfully');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Profile
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Your admin account
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 text-xl font-bold shrink-0">
            {initials(name) || 'P'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {name}
            </p>
            <p className="text-sm text-[var(--text-muted)] truncate">
              {email}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Account">
        <dl className="space-y-3 text-sm">
          <Row label="Name">
            <span className="inline-flex items-center gap-1.5">
              <HiUser className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {name}
            </span>
          </Row>
          <Row label="Email">
            <span className="inline-flex items-center gap-1.5">
              <HiMail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {email}
            </span>
          </Row>
          <Row label="Role">
            <span className="inline-flex items-center gap-1.5">
              <HiShieldCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {role}
            </span>
          </Row>
          {admin?.lastLoginAt && (
            <Row label="Last login">
              {formatDateTime(admin.lastLoginAt)}
            </Row>
          )}
          {admin?.createdAt && (
            <Row label="Created">
              {formatDateTime(admin.createdAt)}
            </Row>
          )}
        </dl>
      </Card>

      <Card title="Change password">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Input
            label="New password"
            type="password"
            hint="At least 8 characters"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Button
            type="submit"
            icon={<HiKey className="w-4 h-4" />}
            loading={busy}
          >
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right">{children}</dd>
    </div>
  );
}