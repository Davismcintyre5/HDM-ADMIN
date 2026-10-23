import { useState } from 'react';
import {
  HiUser,
  HiMail,
  HiShieldCheck,
  HiKey,
  HiPhone,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Button from '../../components/meteo/ui/Button';
import Input from '../../components/meteo/ui/Input';
import Badge from '../../components/meteo/ui/Badge';
import { useAuth } from '../../context/meteo/AuthContext';
import { useToast } from '../../context/meteo/ToastContext';
import {
  updateMe,
  changePassword,
} from '../../services/meteo/auth';
import { initials } from '../../utils/meteo/formatters';
import { formatDate } from '../../utils/meteo/formatDate';

export default function Profile() {
  const { admin, setAdmin } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(admin?.fullName || '');
  const [phone, setPhone] = useState(admin?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const name = admin?.fullName || admin?.name || 'Admin';
  const email = admin?.email || '';
  const role = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateMe({ fullName: fullName.trim(), phone });
      const updated = res?.data?.admin || res?.data || res;
      setAdmin(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('All password fields are required');
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
      toast.success('Password changed');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials(name) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {name}
            </p>
            <p className="text-sm text-[var(--text-muted)] truncate">{email}</p>
            <Badge variant={role === 'Super Admin' ? 'success' : 'info'} dot className="mt-1">
              {role}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="Account details">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<HiUser className="w-4 h-4" />}
          />
          <Input
            label="Email"
            value={email}
            disabled
            icon={<HiMail className="w-4 h-4" />}
            hint="Email cannot be changed"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254712345678"
            icon={<HiPhone className="w-4 h-4" />}
          />
          {admin?.lastLoginAt && (
            <p className="text-xs text-[var(--text-muted)]">
              Last login: {formatDate(admin.lastLoginAt, 'full')}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save changes
            </Button>
          </div>
        </form>
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