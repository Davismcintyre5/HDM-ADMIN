import { useState, useEffect } from 'react';
import { getKeys, getKeyStats, generateKey, revokeKey, restoreKey, changeKeyPlan } from '../../services/hdmai2/keys';
import { getUsers } from '../../services/hdmai2/users';
import { getPlans } from '../../services/hdmai2/plans';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiPlus, HiX, HiRefresh, HiSwitchHorizontal } from 'react-icons/hi';

const statusVariant = { active: 'success', revoked: 'danger', expired: 'warning' };

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ userId: '', planId: '', name: '' });
  const [revokeModal, setRevokeModal] = useState({ open: false, id: null, reason: '' });
  const [planModal, setPlanModal] = useState({ open: false, id: null, planId: '' });
  const [confirmRestore, setConfirmRestore] = useState({ open: false, id: null });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getKeys(), getKeyStats(), getUsers(), getPlans()])
      .then(([k, s, u, p]) => {
        setKeys(k?.data?.keys || k?.data || []);
        setStats(s?.data || s || {});
        setUsers(u?.data?.users || u?.data || []);
        setPlans(Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerate = async () => {
    setActionLoading(true);
    try { await generateKey(genForm); setGenerateModal(false); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRevoke = async () => {
    setActionLoading(true);
    try { await revokeKey(revokeModal.id, { reason: revokeModal.reason }); setRevokeModal({ open: false, id: null, reason: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreKey(confirmRestore.id); setConfirmRestore({ open: false, id: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleChangePlan = async () => {
    setActionLoading(true);
    try { await changeKeyPlan(planModal.id, { planId: planModal.planId }); setPlanModal({ open: false, id: null, planId: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'key', label: 'Key', render: row => <span className="text-xs font-mono">{row.key?.substring(0, 16)}...</span> },
    { key: 'user', label: 'User', render: row => <span className="text-sm">{row.user?.name || row.user?.email || '—'}</span> },
    { key: 'plan', label: 'Plan', render: row => <Badge variant="info">{row.plan?.displayName || row.plan?.name || '—'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'usage', label: 'Usage', render: row => <span className="text-xs">{row.usage?.requestsToday || 0}/{row.rateLimit?.requestsPerDay || row.limits?.requestsPerDay || '—'}</span> },
    { key: 'createdAt', label: 'Created', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        {row.status === 'active' && (
          <>
            <Button size="sm" variant="secondary" onClick={() => setPlanModal({ open: true, id: row._id, planId: row.plan?._id })}><HiSwitchHorizontal className="w-3 h-3" /></Button>
            <Button size="sm" variant="warning" onClick={() => setRevokeModal({ open: true, id: row._id, reason: '' })}><HiX className="w-3 h-3" /></Button>
          </>
        )}
        {row.status === 'revoked' && (
          <Button size="sm" variant="success" onClick={() => setConfirmRestore({ open: true, id: row._id })}><HiRefresh className="w-3 h-3" /></Button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">API Keys</h1>
        <Button onClick={() => { setGenForm({ userId: '', planId: '', name: '' }); setGenerateModal(true); }}><HiPlus className="w-4 h-4 mr-1" /> Generate Key</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBadge label="Total" value={stats.total} />
        <StatBadge label="Active" value={stats.active} color="green" />
        <StatBadge label="Revoked" value={stats.revoked} color="red" />
        <StatBadge label="Requests" value={stats.totalRequests} />
      </div>

      <Card>
        <Table columns={columns} data={keys} loading={loading} emptyMessage="No API keys found." />
      </Card>

      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Generate API Key" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">User</label>
            <select value={genForm.userId} onChange={e => setGenForm({ ...genForm, userId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="">Select user</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name || u.firstName} {u.lastName || ''} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plan</label>
            <select value={genForm.planId} onChange={e => setGenForm({ ...genForm, planId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="">Select plan</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.displayName || p.name}</option>)}
            </select>
          </div>
          <Input label="Key Name" value={genForm.name} onChange={e => setGenForm({ ...genForm, name: e.target.value })} placeholder="Production Key" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setGenerateModal(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={actionLoading}>Generate</Button>
          </div>
        </div>
      </Modal>

      <Modal open={revokeModal.open} onClose={() => setRevokeModal({ open: false, id: null, reason: '' })} title="Revoke Key">
        <Input label="Reason" value={revokeModal.reason} onChange={e => setRevokeModal({ ...revokeModal, reason: e.target.value })} placeholder="Reason for revocation" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setRevokeModal({ open: false, id: null, reason: '' })}>Cancel</Button>
          <Button variant="danger" onClick={handleRevoke} loading={actionLoading}>Revoke</Button>
        </div>
      </Modal>

      <Modal open={planModal.open} onClose={() => setPlanModal({ open: false, id: null, planId: '' })} title="Change Plan">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Plan</label>
          <select value={planModal.planId} onChange={e => setPlanModal({ ...planModal, planId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            {plans.map(p => <option key={p._id} value={p._id}>{p.displayName || p.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setPlanModal({ open: false, id: null, planId: '' })}>Cancel</Button>
          <Button onClick={handleChangePlan} loading={actionLoading}>Change</Button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmRestore.open} onClose={() => setConfirmRestore({ open: false, id: null })} onConfirm={handleRestore}
        title="Restore Key" message="Restore this API key?" confirmLabel="Restore" variant="success" loading={actionLoading} />
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${color === 'green' ? 'text-green-500' : color === 'red' ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>{value ?? '—'}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}