import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiKey,
  HiSave,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Modal from '../../components/meteo/ui/Modal';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import {
  getUser,
  updateUser,
  resetUserPassword,
  updateUserApiKeyLimit,
} from '../../services/meteo/users';
import { formatDate } from '../../utils/meteo/formatDate';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'user', label: 'User' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    role: 'user',
    status: 'active',
  });

  const [apiKeyLimit, setApiKeyLimit] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUser(id);
      const u = res?.data?.user || res?.data || res;
      setUser(u);
      setForm({
        fullName: u.fullName || '',
        phone: u.phone || '',
        role: u.role || 'user',
        status: u.status || 'active',
      });
      setApiKeyLimit(
        u.apiKeyLimit === null ? '' : String(u.apiKeyLimit)
      );
    } catch (err) {
      toast.error(err.message || 'Failed to load user');
      navigate('/meteo/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await updateUser(id, form);
      const updated = res?.data?.user || res?.data || res;
      if (updated) setUser(updated);
      toast.success('User updated');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveApiKeyLimit = async () => {
    setSavingKey(true);
    try {
      const value = apiKeyLimit.trim() === '' ? null : Number(apiKeyLimit);
      if (value !== null && (isNaN(value) || value < 0)) {
        toast.error('Must be a number ≥ 0, or empty for default');
        return;
      }
      const res = await updateUserApiKeyLimit(id, { apiKeyLimit: value });
      const updated = res?.data?.user || res?.data;
      if (updated) setUser((prev) => ({ ...prev, ...updated }));
      toast.success('API key limit updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSavingKey(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setResetting(true);
    try {
      await resetUserPassword(id, { newPassword });
      toast.success('Password reset');
      setResetOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/meteo/users')}
        >
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {user.fullName || 'User'}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
      </div>

      <Card title="Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Email"
            value={user.email}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={ROLE_OPTIONS}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              icon={<HiKey className="w-4 h-4" />}
              onClick={() => {
                setNewPassword('');
                setResetOpen(true);
              }}
            >
              Reset password
            </Button>
            <Button type="submit" icon={<HiSave className="w-4 h-4" />} loading={busy}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="API Key Limit">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Control how many API keys this user can create. Leave empty to use the
          global default. Use <strong>0</strong> for unlimited.
        </p>
        <div className="flex gap-3 items-end">
          <Input
            label="Max keys"
            type="number"
            min="0"
            value={apiKeyLimit}
            onChange={(e) => setApiKeyLimit(e.target.value)}
            placeholder="Leave empty for default"
            hint={
              user.apiKeyLimit === null
                ? 'Currently: default'
                : user.apiKeyLimit === 0
                ? 'Currently: unlimited'
                : `Currently: ${user.apiKeyLimit}`
            }
          />
          <Button onClick={handleSaveApiKeyLimit} loading={savingKey}>
            Save limit
          </Button>
        </div>
      </Card>

      <Card>
        <dl className="space-y-3 text-sm">
          <Row label="User ID">
            <span className="font-mono text-xs">{user._id}</span>
          </Row>
          {user.tenantId && (
            <Row label="Tenant">
              <button
                onClick={() => navigate(`/meteo/tenants/${user.tenantId}`)}
                className="text-violet-600 hover:underline text-xs"
                type="button"
              >
                {user.tenantId}
              </button>
            </Row>
          )}
          <Row label="Created">
            {user.createdAt ? formatDate(user.createdAt, 'full') : '—'}
          </Row>
          {user.lastLoginAt && (
            <Row label="Last login">
              {formatDate(user.lastLoginAt, 'full')}
            </Row>
          )}
        </dl>
      </Card>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset password"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleResetPassword}
              loading={resetting}
              disabled={newPassword.length < 8}
            >
              Reset password
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Set a new password for <strong>{user.email}</strong>. The current
          password is not required. The user will be able to log in with the new
          password immediately.
        </p>
        <Input
          label="New password"
          type="password"
          hint="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right text-xs break-all">
        {children}
      </dd>
    </div>
  );
}