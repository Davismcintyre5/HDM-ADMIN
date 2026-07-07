import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, resetPassword, suspendUser, activateUser, deleteUser, startTrial, extendTrial, convertToFull } from '../../services/farmwise/users';
import Card from '../../components/farmwise/ui/Card';
import Table from '../../components/farmwise/ui/Table';
import Badge from '../../components/farmwise/ui/Badge';
import Button from '../../components/farmwise/ui/Button';
import Input from '../../components/farmwise/ui/Input';
import Modal from '../../components/farmwise/ui/Modal';
import ConfirmDialog from '../../components/farmwise/ui/ConfirmDialog';
import { formatDate } from '../../utils/farmwise/formatDate';
import { HiPlus, HiPencil, HiLockClosed, HiBan, HiCheck, HiTrash, HiClock, HiStar } from 'react-icons/hi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });
  const [trialModal, setTrialModal] = useState({ open: false, id: null, name: '', mode: 'start' });
  const [trialDays, setTrialDays] = useState(14);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '', county: '', trial: '' });

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', password: '', farmName: '', county: '', trial: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (user) => { setForm({ name: user.name || '', email: user.email || '', farmName: user.farmName || '', county: user.farmLocation?.county || '', password: '', trial: '' }); setModal({ open: true, mode: 'edit', data: user }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form };
      if (data.trial) data.trial = parseInt(data.trial);
      else delete data.trial;
      if (modal.mode === 'create') await createUser(data);
      else await updateUser(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.id);
      else if (confirm.type === 'activate') await activateUser(confirm.id);
      else if (confirm.type === 'resetPassword') await resetPassword(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  const handleTrialAction = async () => {
    setActionLoading(true);
    try {
      if (trialModal.mode === 'start') await startTrial(trialModal.id, trialDays);
      else if (trialModal.mode === 'extend') await extendTrial(trialModal.id, trialDays);
      else if (trialModal.mode === 'convert') await convertToFull(trialModal.id);
      setTrialModal({ open: false, id: null, name: '', mode: 'start' });
      setTrialDays(14);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const trialStatusVariant = { none: 'default', trial: 'info', active: 'success', expired: 'danger' };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: row => <span className="font-medium text-[var(--text-primary)]">{row.name || 'N/A'}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'farmName', label: 'Farm', render: row => row.farmName || '—' },
    { key: 'farmLocation.county', label: 'County', render: row => row.farmLocation?.county || '—' },
    {
      key: 'trialStatus', label: 'Access',
      render: row => {
        const ts = row.trialStatus || (row.status === 'active' ? 'active' : 'none');
        const labels = { none: 'None', trial: 'Trial', active: 'Full', expired: 'Expired' };
        return (
          <div className="flex items-center gap-1">
            <Badge variant={trialStatusVariant[ts] || 'default'}>{labels[ts] || ts}</Badge>
            {ts === 'trial' && row.trialEndsAt && (
              <span className="text-[10px] text-[var(--text-muted)]">
                {Math.ceil((new Date(row.trialEndsAt) - new Date()) / 86400000)}d left
              </span>
            )}
          </div>
        );
      },
    },
    { key: 'createdAt', label: 'Created', render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'resetPassword', name: row.name })}><HiLockClosed className="w-4 h-4" /></Button>
          {row.status === 'active' ? (
            <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'suspend', name: row.name })}><HiBan className="w-4 h-4" /></Button>
          ) : (
            <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'activate', name: row.name })}><HiCheck className="w-4 h-4" /></Button>
          )}
          {(!row.trialStatus || row.trialStatus === 'none') && (
            <Button size="sm" variant="info" onClick={() => { setTrialModal({ open: true, id: row._id || row.id, name: row.name, mode: 'start' }); setTrialDays(14); }} title="Start Trial"><HiClock className="w-4 h-4" /></Button>
          )}
          {(row.trialStatus === 'trial' || row.trialStatus === 'expired') && (
            <>
              <Button size="sm" variant="info" onClick={() => { setTrialModal({ open: true, id: row._id || row.id, name: row.name, mode: 'extend' }); setTrialDays(7); }} title="Extend Trial"><HiClock className="w-4 h-4" /></Button>
              <Button size="sm" variant="success" onClick={() => { setTrialModal({ open: true, id: row._id || row.id, name: row.name, mode: 'convert' }); }} title="Convert to Full"><HiStar className="w-4 h-4" /></Button>
            </>
          )}
          <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'delete', name: row.name })}><HiTrash className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Farmers</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Farmer</Button>
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No farmers found." />
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Farm Admin' : 'Edit Farm Admin'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          {modal.mode === 'create' && <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />}
          <Input label="Farm Name" value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} required />
          <Input label="County" value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} required />
          {modal.mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Trial Period</label>
              <select value={form.trial} onChange={e => setForm({ ...form, trial: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
                <option value="">Full Access (No Trial)</option>
                <option value="7">7 Day Trial</option>
                <option value="14">14 Day Trial</option>
                <option value="30">30 Day Trial</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Trial Modal */}
      <Modal open={trialModal.open} onClose={() => setTrialModal({ open: false, id: null, name: '', mode: 'start' })} title={
        trialModal.mode === 'start' ? 'Start Trial' : trialModal.mode === 'extend' ? 'Extend Trial' : 'Convert to Full Access'
      } size="sm">
        <div className="space-y-4">
          {trialModal.mode === 'convert' ? (
            <p className="text-sm text-[var(--text-secondary)]">Convert <strong>{trialModal.name}</strong> to full access? This removes all trial restrictions permanently.</p>
          ) : (
            <>
              <p className="text-sm text-[var(--text-secondary)]">
                {trialModal.mode === 'start' ? 'Start a trial for' : 'Extend trial for'} <strong>{trialModal.name}</strong>.
              </p>
              <Input label="Days" type="number" value={trialDays} onChange={e => setTrialDays(+e.target.value)} min="1" max="365" />
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setTrialModal({ open: false, id: null, name: '', mode: 'start' })}>Cancel</Button>
            <Button onClick={handleTrialAction} loading={actionLoading}>
              {trialModal.mode === 'start' ? 'Start Trial' : trialModal.mode === 'extend' ? 'Extend' : 'Convert'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog open={confirm.open && confirm.type === 'suspend'} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title="Suspend Farmer" message={`Suspend ${confirm.name}?`} confirmLabel="Suspend" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirm.open && confirm.type === 'resetPassword'} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title="Reset Password" message={`Reset password for ${confirm.name}?`} confirmLabel="Reset" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirm.open && confirm.type === 'delete'} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title="Delete Farmer" message={`Permanently delete ${confirm.name} and all their farm data?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}