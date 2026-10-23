import { useEffect, useState } from 'react';
import {
  HiPlus,
  HiLockClosed,
  HiLockOpen,
  HiTrash,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import ConfirmDialog from '../../components/meteo/ui/ConfirmDialog';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { useAuth } from '../../context/meteo/AuthContext';
import {
  listAdmins,
  createAdmin,
  toggleAdmin,
  deleteAdmin,
} from '../../services/meteo/auth';
import { formatDate } from '../../utils/meteo/formatDate';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  role: 'admin',
  phone: '',
};

export default function Admins() {
  const toast = useToast();
  const { admin: me } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, admin: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await listAdmins();
      const data = res?.data || res;
      setAdmins(data?.admins || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setCreating(true);
    try {
      await createAdmin(form);
      toast.success('Admin created');
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (a) => {
    const id = a._id || a.id;
    setBusyId(id);
    try {
      await toggleAdmin(id);
      toast.success(`Admin ${a.status === 'active' ? 'suspended' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.admin) return;
    const id = confirmDelete.admin._id || confirmDelete.admin.id;
    setBusyId(id);
    try {
      await deleteAdmin(id);
      toast.success('Admin deleted');
      setConfirmDelete({ open: false, admin: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Admin',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.fullName || '—'}
            {row._id === me?._id && (
              <span className="ml-2 text-[10px] text-violet-600 font-mono">
                (you)
              </span>
            )}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'super_admin' ? 'warning' : 'info'}>
          {statusLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status || 'active')}
        </Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last login',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const id = row._id || row.id;
        const isMe = row._id === me?._id;
        const busy = busyId === id;
        return (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant={row.status === 'active' ? 'warning' : 'success'}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(row);
              }}
              loading={busy}
              disabled={isMe}
              title={isMe ? 'Cannot toggle yourself' : row.status === 'active' ? 'Suspend' : 'Activate'}
            >
              {row.status === 'active' ? (
                <HiLockClosed className="w-4 h-4" />
              ) : (
                <HiLockOpen className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete({ open: true, admin: row });
              }}
              disabled={busy || isMe}
              title={isMe ? 'Cannot delete yourself' : 'Delete'}
            >
              <HiTrash className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Admins
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<HiPlus className="w-4 h-4" />}
          onClick={() => {
            setForm(EMPTY_FORM);
            setCreateOpen(true);
          }}
        >
          New admin
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={admins}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No admins found"
          />
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New admin"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full name *"
            value={form.fullName}
            onChange={(e) => patch('fullName', e.target.value)}
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => patch('email', e.target.value)}
          />
          <Input
            label="Password *"
            type="password"
            hint="At least 8 characters"
            value={form.password}
            onChange={(e) => patch('password', e.target.value)}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => patch('role', e.target.value)}
            options={ROLE_OPTIONS}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => patch('phone', e.target.value)}
            placeholder="+254712345678"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, admin: null })}
        onConfirm={handleDelete}
        title="Delete admin"
        message={`Permanently delete ${confirmDelete.admin?.fullName}? They will lose access immediately.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busyId === (confirmDelete.admin?._id || confirmDelete.admin?.id)}
      />
    </div>
  );
}