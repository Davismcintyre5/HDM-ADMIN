import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser, suspendUser, reactivateUser, deleteUser } from '../../../services/vault/users';
import Card from '../../../components/vault/ui/Card';
import Badge from '../../../components/vault/ui/Badge';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import ConfirmDialog from '../../../components/vault/ui/ConfirmDialog';
import { formatDate } from '../../../utils/vault/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = () => {
    setLoading(true);
    getUser(id)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(id);
      else if (confirm.type === 'reactivate') await reactivateUser(id);
      else if (confirm.type === 'delete') {
        await deleteUser(id);
        navigate('/hdmvault/users');
        return;
      }
      setConfirm({ open: false, type: '' });
      fetchUser();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <Card className="text-center text-red-500">User not found</Card>;

  const suspended = user.status === 'suspended' || user.isSuspended || user.orgId?.status === 'suspended';

  return (
    <div>
      <button onClick={() => navigate('/hdmvault/users')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Users
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.fullName || 'User Detail'}</h1>
        <div className="flex gap-2">
          {suspended ? (
            <Button variant="success" onClick={() => setConfirm({ open: true, type: 'reactivate' })}>Reactivate</Button>
          ) : (
            <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}>Suspend</Button>
          )}
          <Button variant="danger" onClick={() => setConfirm({ open: true, type: 'delete' })}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)]">{user.fullName || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{user.email || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{user.phone || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Role:</dt><dd><Badge variant={user.role === 'orgOwner' ? 'orange' : 'default'}>{user.role || 'user'}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={suspended ? 'danger' : 'success'}>{suspended ? 'Suspended' : 'Active'}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">2FA:</dt><dd className="text-[var(--text-primary)]">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email Verified:</dt><dd className="text-[var(--text-primary)]">{user.emailVerified ? 'Yes' : 'No'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Last Login:</dt><dd className="text-[var(--text-primary)]">{formatDate(user.lastLoginAt, 'full')}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Joined:</dt><dd className="text-[var(--text-primary)]">{formatDate(user.createdAt, 'full')}</dd></div>
          </dl>
        </Card>

        {user.orgId && (
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Organization</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)]">{user.orgId.name || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Plan:</dt><dd><Badge variant="orange">{user.orgId.planTier || 'N/A'}</Badge></dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={user.orgId.status === 'active' ? 'success' : 'danger'}>{user.orgId.status}</Badge></dd></div>
            </dl>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, type: '' })}
        title={confirm.type === 'delete' ? 'Delete User' : confirm.type === 'suspend' ? 'Suspend User' : 'Reactivate User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user and ALL their data (vault, devices, logs)? This cannot be undone.' : `${confirm.type} this user?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}