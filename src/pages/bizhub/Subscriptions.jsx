import { useEffect, useState } from 'react';
import { getSubscriptions, approveSubscription, rejectSubscription, cancelSubscription, deleteSubscription, addManualSubscription } from '../../services/bizhub/subscriptions';
import { getUsers } from '../../services/bizhub/users';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Modal from '../../components/bizhub/ui/Modal';
import Input from '../../components/bizhub/ui/Input';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiPlus, HiCheck, HiX, HiBan, HiTrash, HiEye } from 'react-icons/hi';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, subscription: null });
  const [form, setForm] = useState({ userId: '', modules: [], plan: 'monthly', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', title: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (moduleFilter) params.module = moduleFilter;
    Promise.all([getSubscriptions(params), getUsers()])
      .then(([subs, usrs]) => {
        setSubscriptions(subs.data || subs || []);
        setUsers(usrs.data || usrs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [statusFilter, moduleFilter]);

  const handleApprove = async () => {
    setActionLoading(true);
    try { await approveSubscription(confirm.id); setConfirm({ open: false, id: null, type: '', title: '', message: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectSubscription(confirm.id); setConfirm({ open: false, id: null, type: '', title: '', message: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleCancel = async (id) => {
    try { await cancelSubscription(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteSubscription(confirm.id); setConfirm({ open: false, id: null, type: '', title: '', message: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    try { await addManualSubscription(form); setModal(false); setForm({ userId: '', modules: [], plan: 'monthly', startDate: '', endDate: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setSaving(false);
  };

  const statusV = { pending: 'warning', active: 'success', expired: 'default', cancelled: 'danger' };

  const columns = [
    { key: 'user', label: 'User', render: (row) => (
      <div>
        <div className="font-medium text-[var(--text-primary)]">{row.user?.name || 'N/A'}</div>
        <div className="text-xs text-[var(--text-muted)]">{row.user?.email}</div>
      </div>
    )},
    { key: 'business', label: 'Business', render: (row) => <span className="text-sm">{row.user?.businessName || '—'}</span> },
    { key: 'modules', label: 'Modules', render: (row) => (
      <div className="flex gap-1 flex-wrap">{(row.modules || []).map(m => <Badge key={m} variant="teal">{m}</Badge>)}</div>
    )},
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="gradient">{row.plan}</Badge> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium text-sm">KES {row.amount?.toLocaleString() || '—'}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, subscription: row })}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'pending' && (
          <>
            <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'approve', title: 'Approve Subscription', message: 'Approve this subscription? User will be activated and license key sent via email & SMS.' })}><HiCheck className="w-4 h-4" /></Button>
            <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'reject', title: 'Reject Subscription', message: 'Reject this subscription? User and license will be permanently removed.' })}><HiX className="w-4 h-4" /></Button>
          </>
        )}
        {row.status === 'active' && (
          <>
            <Button size="sm" variant="warning" onClick={() => { if (window.confirm('Cancel this subscription?')) handleCancel(row._id); }}><HiBan className="w-4 h-4" /></Button>
            <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', title: 'Delete Subscription', message: 'Permanently delete this subscription and license? This cannot be undone.' })}><HiTrash className="w-4 h-4" /></Button>
          </>
        )}
        {(row.status === 'expired' || row.status === 'cancelled') && (
          <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', title: 'Delete Subscription', message: 'Permanently delete this subscription?' })}><HiTrash className="w-4 h-4" /></Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscriptions</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            <option value="">All Modules</option>
            <option value="pharma">PharmaSys</option>
            <option value="electro">ElectroStore</option>
            <option value="resto">RestoManagerKE</option>
            <option value="apartment">MyApartment</option>
          </select>
          <Button onClick={() => setModal(true)}><HiPlus className="w-4 h-4 mr-1" /> Add Manual</Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={subscriptions} loading={loading} emptyMessage="No subscriptions found." />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, subscription: null })} title="Subscription Details" size="md">
        {viewModal.subscription && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">User:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.subscription.user?.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.subscription.user?.email || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.subscription.user?.phone || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Business:</span><span className="text-[var(--text-primary)]">{viewModal.subscription.user?.businessName || 'N/A'}</span></div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="gradient">{viewModal.subscription.plan}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">KES {viewModal.subscription.amount?.toLocaleString() || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusV[viewModal.subscription.status] || 'default'}>{viewModal.subscription.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Payment:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.subscription.paymentMethod || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Modules:</span><div className="flex gap-1">{(viewModal.subscription.modules || []).map(m => <Badge key={m} variant="teal">{m}</Badge>)}</div></div>
            </div>
            {viewModal.subscription.licenseKey && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">License Key:</span><code className="text-[var(--text-primary)] font-mono text-xs">{viewModal.subscription.licenseKey}</code></div>
              </div>
            )}
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <div className="flex justify-between"><span>Created:</span><span>{formatDate(viewModal.subscription.createdAt, 'full')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Manual Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Manual Subscription" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">User</label>
            <select value={form.userId} onChange={(e) => setForm(p => ({ ...p, userId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="">Select User</option>
              {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <Input label="Modules (comma separated)" value={form.modules.join(', ')} onChange={(e) => setForm(p => ({ ...p, modules: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="pharma, resto" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plan</label>
            <select value={form.plan} onChange={(e) => setForm(p => ({ ...p, plan: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={saving}>Add Subscription</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '', title: '', message: '' })}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.type === 'approve' ? 'Approve' : confirm.type === 'reject' ? 'Reject' : 'Delete'}
        variant={confirm.type === 'approve' ? 'success' : 'danger'}
        onConfirm={confirm.type === 'approve' ? handleApprove : confirm.type === 'reject' ? handleReject : handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}