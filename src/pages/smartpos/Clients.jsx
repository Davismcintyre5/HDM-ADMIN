import { useState, useEffect } from 'react';
import { getClients, getPendingClients, approveClient, rejectClient, suspendClient, restoreClient, extendTrial, issueEnt, revokeEnt, impersonateClient, deleteClient, createClient } from '../../services/smartpos/clients';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import SearchBar from '../../components/smartpos/ui/SearchBar';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiEye, HiPlus, HiCheck, HiX, HiTrash } from 'react-icons/hi';

const TABS = [
  { key: 'all', label: 'All Clients' },
  { key: 'pending', label: 'Pending Approvals' },
];

const statusVariant = { active: 'success', inactive: 'warning', suspended: 'danger', rejected: 'default', perpetual: 'info' };
const planVariant = { trial: 'info', starter: 'default', pro: 'success', ent: 'warning' };

export default function Clients() {
  const [activeTab, setActiveTab] = useState('all');
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, client: null });
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', ownerName: '', ownerEmail: '', ownerPhone: '', country: '', subscriptionCurrency: 'USD', storeCurrency: 'KES', plan: 'trial' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [suspendModal, setSuspendModal] = useState({ open: false, id: null, name: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [trialModal, setTrialModal] = useState({ open: false, id: null, name: '' });
  const [trialDays, setTrialDays] = useState(7);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    if (activeTab === 'pending') {
      getPendingClients()
        .then(res => { setClients(res?.data || []); setPagination({ page: 1, pages: 1 }); })
        .catch(console.error).finally(() => setLoading(false));
    } else {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;
      if (search) params.search = search;
      getClients(params)
        .then(res => {
          setClients(res?.data || []);
          setPagination(res?.meta || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, [page, filter, search, activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try { await approveClient(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectClient(rejectModal.id, { reason: rejectReason }); setRejectModal({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendClient(suspendModal.id, { reason: suspendReason }); setSuspendModal({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try { await restoreClient(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleExtendTrial = async () => {
    setActionLoading(true);
    try { await extendTrial(trialModal.id, { days: trialDays }); setTrialModal({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleIssueEnt = async (id) => {
    if (!window.confirm('Issue perpetual Enterprise? This cannot be undone automatically.')) return;
    setActionLoading(true);
    try { await issueEnt(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRevokeEnt = async (id) => {
    if (!window.confirm('Revoke Enterprise? Client will be suspended.')) return;
    setActionLoading(true);
    try { await revokeEnt(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleImpersonate = async (id) => {
    setActionLoading(true);
    try {
      const res = await impersonateClient(id);
      const d = res?.data || res;
      alert(`Impersonation ready: ${d.name} (tenant ${d.tenantId})`);
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteClient(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name || !form.ownerEmail) return alert('Name and owner email are required');
    setActionLoading(true);
    try { await createClient(form); setCreateModal(false); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Client', render: row => (
      <button onClick={() => setViewModal({ open: true, client: row })} className="text-blue-600 hover:underline font-medium">{row.name}</button>
    )},
    { key: 'owner', label: 'Owner', render: row => <span className="text-sm">{row.ownerName || '—'}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.ownerEmail || '—'}</span> },
    { key: 'plan', label: 'Plan', render: row => <Badge variant={planVariant[row.plan] || 'default'}>{row.plan || '—'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'currency', label: 'Currency', render: row => <span className="text-xs">{row.subscriptionCurrency} / {row.storeCurrency}</span> },
    { key: 'periodEnd', label: 'Period End', render: row => row.periodEnd ? formatDate(row.periodEnd) : '—' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1 flex-wrap">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, client: row })}><HiEye className="w-3 h-3" /></Button>
        {activeTab === 'pending' && (
          <>
            <Button size="sm" variant="success" onClick={() => handleApprove(row._id || row.id)}><HiCheck className="w-3 h-3" /></Button>
            <Button size="sm" variant="danger" onClick={() => { setRejectReason(''); setRejectModal({ open: true, id: row._id || row.id, name: row.name }); }}><HiX className="w-3 h-3" /></Button>
          </>
        )}
        {activeTab === 'all' && (
          <>
            {row.status === 'suspended' ? (
              <Button size="sm" variant="success" onClick={() => handleRestore(row._id || row.id)}>Restore</Button>
            ) : (
              <Button size="sm" variant="warning" onClick={() => { setSuspendReason(''); setSuspendModal({ open: true, id: row._id || row.id, name: row.name }); }}>Suspend</Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => { setTrialDays(7); setTrialModal({ open: true, id: row._id || row.id, name: row.name }); }}>+Trial</Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clients</h1>
        <div className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search clients..." />
          <Button onClick={() => { setForm({ name: '', ownerName: '', ownerEmail: '', ownerPhone: '', country: '', subscriptionCurrency: 'USD', storeCurrency: 'KES', plan: 'trial' }); setCreateModal(true); }}>
            <HiPlus className="w-4 h-4 mr-1" /> Add Client
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[{ key: '', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }, { key: 'suspended', label: 'Suspended' }, { key: 'perpetual', label: 'Enterprise' }].map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      <Card>
        <Table columns={columns} data={clients} loading={loading} emptyMessage="No clients found." />
        {activeTab === 'all' && <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />}
      </Card>

      {/* View Client Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, client: null })} title="Client Details" size="lg">
        {viewModal.client && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.client.name} bold />
              <Row label="Slug" value={viewModal.client.slug} mono />
              <Row label="Owner" value={viewModal.client.ownerName} />
              <Row label="Email" value={viewModal.client.ownerEmail} />
              <Row label="Plan" value={viewModal.client.plan} />
              <Row label="Status" value={viewModal.client.status} />
              <Row label="Subscription Currency" value={viewModal.client.subscriptionCurrency} />
              <Row label="Store Currency" value={viewModal.client.storeCurrency} />
              <Row label="Period Start" value={viewModal.client.periodStart ? formatDate(viewModal.client.periodStart, 'full') : '—'} />
              <Row label="Period End" value={viewModal.client.periodEnd ? formatDate(viewModal.client.periodEnd, 'full') : '—'} />
            </div>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={() => handleImpersonate(viewModal.client._id || viewModal.client.id)}>Impersonate</Button>
              {viewModal.client.plan !== 'ent' ? (
                <Button size="sm" variant="success" onClick={() => handleIssueEnt(viewModal.client._id || viewModal.client.id)}>Issue Enterprise</Button>
              ) : (
                <Button size="sm" variant="warning" onClick={() => handleRevokeEnt(viewModal.client._id || viewModal.client.id)}>Revoke Enterprise</Button>
              )}
              <Button size="sm" variant="danger" onClick={() => { setConfirmDelete({ open: true, id: viewModal.client._id || viewModal.client.id, name: viewModal.client.name }); setViewModal({ open: false, client: null }); }}>
                <HiTrash className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add Client" size="lg">
        <div className="space-y-4">
          <Input label="Business Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Owner Name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
            <Input label="Owner Email" type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Owner Phone" value={form.ownerPhone} onChange={e => setForm({ ...form, ownerPhone: e.target.value })} />
            <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Subscription Currency</label>
              <select value={form.subscriptionCurrency} onChange={e => setForm({ ...form, subscriptionCurrency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['USD', 'EUR', 'GBP', 'KES'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Store Currency</label>
              <select value={form.storeCurrency} onChange={e => setForm({ ...form, storeCurrency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'NGN', 'GHS'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['trial', 'starter', 'pro', 'ent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject — ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>Reject</Button>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal open={suspendModal.open} onClose={() => { setSuspendModal({ open: false, id: null, name: '' }); setSuspendReason(''); }} title={`Suspend — ${suspendModal.name}`}>
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setSuspendModal({ open: false, id: null, name: '' }); setSuspendReason(''); }}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading} disabled={!suspendReason.trim()}>Suspend</Button>
        </div>
      </Modal>

      {/* Trial Modal */}
      <Modal open={trialModal.open} onClose={() => setTrialModal({ open: false, id: null, name: '' })} title={`Extend Trial — ${trialModal.name}`} size="sm">
        <Input label="Days" type="number" value={trialDays} onChange={e => setTrialDays(+e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setTrialModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={handleExtendTrial} loading={actionLoading}>Extend</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Client" message={`Permanently delete ${confirmDelete.name}? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''} ${mono ? 'font-mono text-xs' : ''}`}>{value ?? '—'}</span></div>;
}