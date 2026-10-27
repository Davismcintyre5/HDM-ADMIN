import { useState } from 'react';
import { HiUser, HiMail, HiShieldCheck, HiKey, HiPhone } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import { useAuth } from '../../context/tvetgrid/AuthContext';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { changePassword } from '../../services/tvetgrid/auth';
import { initials } from '../../utils/tvetgrid/formatters';
import { formatDateTime } from '../../utils/tvetgrid/formatDate';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const name = user?.name || user?.fullName || 'Admin';
  const email = user?.email || '';
  const role = user?.role === 'admin' ? 'Admin' : user?.role || 'Admin';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('All fields are required');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      toast.success('Password changed — please log in again on other devices');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      if (err.code === 'INVALID_PASSWORD') {
        toast.error('Current password is incorrect');
      } else {
        toast.error(err.message || 'Failed to change password');
      }
    } finally {
      setSavingPw(false);
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials(name) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {name}
            </p>
            <p className="text-sm text-[var(--text-muted)] truncate">{email}</p>
            <Badge variant="warning" dot className="mt-1">
              {role}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="Account details">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
              <HiUser className="w-3.5 h-3.5" /> Name
            </dt>
            <dd className="text-[var(--text-primary)]">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
              <HiMail className="w-3.5 h-3.5" /> Email
            </dt>
            <dd className="text-[var(--text-primary)]">{email}</dd>
          </div>
          {user?.phone && (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
                <HiPhone className="w-3.5 h-3.5" /> Phone
              </dt>
              <dd className="text-[var(--text-primary)]">{user.phone}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
              <HiShieldCheck className="w-3.5 h-3.5" /> Role
            </dt>
            <dd className="text-[var(--text-primary)] capitalize">{role}</dd>
          </div>
          {user?.lastLoginAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-secondary)]">Last login</dt>
              <dd className="text-[var(--text-primary)]">
                {formatDateTime(user.lastLoginAt)}
              </dd>
            </div>
          )}
          {user?.permissions && (
            <div className="pt-3 border-t border-[var(--border-color)]">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                Permissions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.permissions.map((p) => (
                  <Badge key={p} variant="info">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </dl>
      </Card>

      <Card title="Change password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            hint="At least 8 characters"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Changing your password will sign you out on all other devices. You
            will receive a confirmation email.
          </p>
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={<HiKey className="w-4 h-4" />}
              loading={savingPw}
            >
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}