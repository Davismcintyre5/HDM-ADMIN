import { useState } from 'react';
import { HiKey } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import { useAuth } from '../../context/smartpos/AuthContext';
import { useToast } from '../../context/smartpos/ToastContext';
import { changePassword } from '../../services/smartpos/auth';

export default function Profile() {
  const { admin } = useAuth();
  const toast = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (next.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success('Password changed');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Your admin account</p>
      </div>

      <Card title="Account">
        <dl className="space-y-3 text-sm">
          <Row label="Name">
            {admin?.fullName || admin?.name || '—'}
          </Row>
          <Row label="Email">{admin?.email || '—'}</Row>
          <Row label="Role">
            {admin?.role === 'super_admin' ? 'Super admin' : admin?.role || '—'}
          </Row>
        </dl>
      </Card>

      <Card title="Change password">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <Input
            label="New password"
            hint="At least 8 characters"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
      <dd className="text-[var(--text-primary)]">{children}</dd>
    </div>
  );
}