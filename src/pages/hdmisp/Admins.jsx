import { useEffect, useState, useCallback } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiRefresh, HiSearch,
  HiShieldCheck, HiUser, HiUsers,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Table from '../../components/hdmisp/ui/Table';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Pagination from '../../components/hdmisp/ui/Pagination';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../../services/hdmisp/admins';
import { formatDateTime } from '../../utils/hdmisp/formatDate';
import { initials } from '../../utils/hdmisp/formatters';
import { statusVariant, statusLabel, PAGE_LIMIT } from '../../utils/hdmisp/constants';

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'support', label: 'Support' },
];

const EMPTY_CREATE = {
  name: '',
  email: '',
  phone: '',
  password: '',
  adminRole: 'support',
};

export default function Admins() {
  const toast = useToast();
  const { admin: me, isSuperadmin } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [busy, setBusy] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', adminRole: 'support' });
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdmins({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
      });
      setItems(res.data || []);
      setMeta({
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        total: res.meta?.total || 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async () => {
    const name = createForm.name.trim();
    const email = createForm.email.trim();
    if (!name || !email || !createForm.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setCreating(true);
    try {
      await createAdmin({
        name,
        email,
        phone: createForm.phone.trim() || undefined,
        password: createForm.password,
        adminRole: createForm.adminRole,
      });
      toast.success('Admin created');
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setEditForm({
      name: row.name || '',
      phone: row.phone || '',
      adminRole: row.adminRole || 'support',
    });
  };

  const doUpdate = async () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await updateAdmin(editTarget._id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        adminRole: editForm.adminRole,
      });
      toast.success('Admin updated');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setBusy(confirmDelete._id);
    try {
      await deleteAdmin(confirmDelete._id);
      toast.success('Admin deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Admin',
      render: (row) => {
        const isMe = me?._id && row._id === me._id;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials(row.name) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">
                {row.name || '—'}
                {isMe && (
                  <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                    You
                  </span>
                )}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{row.email}</p>
              {row.phone && <p className="text-xs text-[var(--text-muted)]">{row.phone}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'adminRole',
      label: 'Role',
      render: (row) => (
        <Badge variant={row.adminRole === 'superadmin' ? 'success' : 'default'} dot>
          {row.adminRole === 'superadmin' ? 'Superadmin' : 'Support'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status || 'active')} dot>
          {statusLabel(row.status || 'active')}
        </Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last login',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const isMe = me?._id && row._id === me._id;
        const isBusy = busy === row._id;
        return (
          <div className="flex justify-end gap-1">
            {isSuperadmin && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                title="Edit"
                disabled={isBusy}
              >
                <HiPencil className="w-4 h-4" />
              </Button>
            )}
            {isSuperadmin && !isMe && (
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(row); }}
                title="Delete"
                disabled={isBusy}
              >
                <HiTrash className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admins</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} admin account{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperadmin && (
            <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
              New admin
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="p-4">
          {loading && !items.length ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiUsers className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No admins found</p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={items} rowKey={(r) => r._id} />
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateForm(EMPTY_CREATE); }}
        title="Create admin"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); setCreateForm(EMPTY_CREATE); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Jane Doe"
          />
          <Input
            label="Email *"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="jane@hdm.co.ke"
          />
          <Input
            label="Phone"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            placeholder="254712345678"
          />
          <Input
            label="Temp password *"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            placeholder="Min 8 characters"
            hint="Share this with the admin securely; they can change it later."
          />
          <Select
            label="Role"
            value={createForm.adminRole}
            onChange={(e) => setCreateForm({ ...createForm, adminRole: e.target.value })}
            options={ROLE_OPTIONS}
          />
          <p className="text-xs text-[var(--text-muted)]">
            <HiShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            Superadmins can manage providers, plans, settings, and other admins.
          </p>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.name || 'admin'}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={doUpdate} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Select
            label="Role"
            value={editForm.adminRole}
            onChange={(e) => setEditForm({ ...editForm, adminRole: e.target.value })}
            options={ROLE_OPTIONS}
          />
          <p className="text-xs text-[var(--text-muted)]">
            <HiUser className="w-3.5 h-3.5 inline mr-1" />
            Email and password can't be changed here. The admin can update their own password from their profile.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        title="Delete admin"
        message={`Permanently delete the admin account for "${confirmDelete?.name}"? They will lose access immediately.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy === confirmDelete?._id}
      />
    </div>
  );
}