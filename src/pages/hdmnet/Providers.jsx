import { useState, useEffect } from 'react';
import { getProviders, suspendProvider, activateProvider, deleteProvider, adjustProviderWallet } from '../../services/hdmnet/providers';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import SearchBar from '../../components/hdmnet/ui/SearchBar';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Input from '../../components/hdmnet/ui/Input';
import Modal from '../../components/hdmnet/ui/Modal';
import ConfirmDialog from '../../components/hdmnet/ui/ConfirmDialog';
import Pagination from '../../components/hdmnet/ui/Pagination';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

const statusVariant = { active: 'success', suspended: 'danger' };

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModal, setSuspendModal] = useState({ open: false, id: null, name: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [walletModal, setWalletModal] = useState({ open: false, id: null, name: '' });
  const [walletForm, setWalletForm] = useState({ amount: 0, type: 'credit', description: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const navigate = useNavigate();

  const fetchProviders = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    if (search) params.search = search;
    getProviders(params)
      .then(res => {
        setProviders(res?.data?.providers || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProviders(); }, [page, filter, search]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendProvider(suspendModal.id, { reason: suspendReason }); setSuspendModal({ open: false, id: null, name: '' }); fetchProviders(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleActivate = async (id) => {
    setActionLoading(true);
    try { await activateProvider(id); fetchProviders(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleWallet = async () => {
    setActionLoading(true);
    try { await adjustProviderWallet(walletModal.id, walletForm); setWalletModal({ open: false, id: null, name: '' }); fetchProviders(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteProvider(confirmDelete.id, { reason: 'Admin deleted' }); setConfirmDelete({ open: false, id: null, name: '' }); fetchProviders(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Business Name', render: row => (
      <button onClick={() => navigate(`/hdmnet/providers/${row._id || row.id}`)} className="text-blue-600 hover:underline font-medium">{row.businessName || row.name}</button>
    )},
    { key: 'owner', label: 'Owner', render: row => <span className="text-sm">{row.owner?.name || row.ownerName || '—'}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || row.owner?.email}</span> },
    { key: 'wallet', label: 'Wallet', render: row => <span className="font-medium">{row.walletBalance || 0}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/hdmnet/providers/${row._id || row.id}`)}><HiEye className="w-3 h-3" /></Button>
        {row.status === 'active' ? (
          <Button size="sm" variant="warning" onClick={() => { setSuspendReason(''); setSuspendModal({ open: true, id: row._id || row.id, name: row.businessName || row.name }); }}>Suspend</Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => handleActivate(row._id || row.id)}>Activate</Button>
        )}
        <Button size="sm" variant="info" onClick={() => { setWalletForm({ amount: 0, type: 'credit', description: '' }); setWalletModal({ open: true, id: row._id || row.id, name: row.businessName || row.name }); }}>Wallet</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id, name: row.businessName || row.name })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Providers</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search providers..." />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        <Table columns={columns} data={providers} loading={loading} emptyMessage="No providers found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, id: null, name: '' })} title={`Suspend ${suspendModal.name}`}>
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSuspendModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend</Button>
        </div>
      </Modal>

      <Modal open={walletModal.open} onClose={() => setWalletModal({ open: false, id: null, name: '' })} title={`Adjust Wallet - ${walletModal.name}`}>
        <div className="space-y-4">
          <Input label="Amount" type="number" value={walletForm.amount} onChange={e => setWalletForm({ ...walletForm, amount: +e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={walletForm.type} onChange={e => setWalletForm({ ...walletForm, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['credit', 'debit'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Description" value={walletForm.description} onChange={e => setWalletForm({ ...walletForm, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWalletModal({ open: false, id: null, name: '' })}>Cancel</Button>
            <Button onClick={handleWallet} loading={actionLoading}>Update</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Provider" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}