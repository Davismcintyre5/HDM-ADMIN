import { useState, useEffect } from 'react';
import { getUsers, disableUser, enableUser, resetUserPassword } from '../../../services/bizhub/users';
import { getTenants } from '../../../services/bizhub/tenants';
import Card from '../../../components/bizhub/ui/Card';
import Table from '../../../components/bizhub/ui/Table';
import Badge from '../../../components/bizhub/ui/Badge';
import Button from '../../../components/bizhub/ui/Button';
import Input from '../../../components/bizhub/ui/Input';
import Modal from '../../../components/bizhub/ui/Modal';
import ConfirmDialog from '../../../components/bizhub/ui/ConfirmDialog';
import SearchBar from '../../../components/bizhub/ui/SearchBar';
import { formatDate } from '../../../utils/bizhub/formatDate';
import { HiBan, HiCheck, HiLockClosed } from 'react-icons/hi';

export default function UsersSettings() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [resetModal, setResetModal] = useState({ open: false, id: null, tenantId: '', name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, tenantId: '', type: '', name: '' });

  useEffect(() => {
    getTenants({ limit: 200, status: 'active' })
      .then(res => {
        const list = res?.data || res || [];
        setTenants(Array.isArray(list) ? list : list.tenants || []);
      })
      .catch(() => setTenants([]));
  }, []);

  const fetchUsers = () => {
    if (!selectedTenant) return;
    setLoading(true);
    getUsers({ tenantId: selectedTenant, search: search || undefined })
      .then(res => setUsers(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [selectedTenant, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'disable') await disableUser(confirm.id, confirm.tenantId);
      else if (confirm.type === 'enable') await enableUser(confirm.id, confirm.tenantId);
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, tenantId: '', type: '', name: '' });
  };

  const handleResetPassword = async () => {
    setActionLoading(true);
    try {
      await resetUserPassword(resetModal.id, resetModal.tenantId, newPassword);
      setResetModal({ open: false, id: null, tenantId: '', name: '' });
      setNewPassword('');
      alert('Password reset!');
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: row => <span className="font-medium text-[var(--text-primary)]">{row.name || 'N/A'}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: row => <Badge variant="teal">{row.role || 'user'}</Badge>,
    },
    {
      key: 'isActive', label: 'Status',
      render: row => (
        <Badge variant={row.isActive !== false ? 'success' : 'danger'}>
          {row.isActive !== false ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'createdAt', label: 'Joined',
      render: row => formatDate(row.createdAt),
    },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <div className="flex gap-1">
          {row.isActive !== false ? (
            <Button
              size="sm"
              variant="warning"
              onClick={() =>
                setConfirm({ open: true, id: row._id, tenantId: selectedTenant, type: 'disable', name: row.name })
              }
            >
              <HiBan className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              onClick={() =>
                setConfirm({ open: true, id: row._id, tenantId: selectedTenant, type: 'enable', name: row.name })
              }
            >
              <HiCheck className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setResetModal({ open: true, id: row._id, tenantId: selectedTenant, name: row.name })
            }
          >
            <HiLockClosed className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold text-[var(--text-primary)]">Tenant Users</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={selectedTenant}
            onChange={e => setSelectedTenant(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
          >
            <option value="">Select a tenant...</option>
            {tenants.map(t => (
              <option key={t._id} value={t._id}>
                {t.businessName || t.name}
              </option>
            ))}
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
        </div>
      </div>

      {!selectedTenant ? (
        <Card>
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">
            Select a tenant to view their users.
          </p>
        </Card>
      ) : (
        <Card>
          <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        </Card>
      )}

      {/* Reset Password Modal */}
      <Modal
        open={resetModal.open}
        onClose={() => {
          setResetModal({ open: false, id: null, tenantId: '', name: '' });
          setNewPassword('');
        }}
        title={`Reset Password — ${resetModal.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setResetModal({ open: false, id: null, tenantId: '', name: '' });
                setNewPassword('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} loading={actionLoading}>
              Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enable/Disable Confirm */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, tenantId: '', type: '', name: '' })}
        onConfirm={handleAction}
        title={confirm.type === 'disable' ? 'Disable User' : 'Enable User'}
        message={`${confirm.type === 'disable' ? 'Disable' : 'Enable'} ${confirm.name}?`}
        confirmLabel={confirm.type === 'disable' ? 'Disable' : 'Enable'}
        variant={confirm.type === 'disable' ? 'warning' : 'success'}
        loading={actionLoading}
      />
    </div>
  );
}