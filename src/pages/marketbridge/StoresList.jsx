import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStores, getStore, suspendStore, activateStore, changeStoreTier, permanentDeleteStore } from '../../services/marketbridge/stores';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import SearchBar from '../../components/marketbridge/ui/SearchBar';
import Pagination from '../../components/marketbridge/ui/Pagination';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiEye, HiBan, HiCheck, HiTrash } from 'react-icons/hi';

const TIERS = ['basic', 'pro', 'enterprise'];

export default function StoresList() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, store: null, loading: false });

  const fetchStores = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    getStores(params)
      .then(res => {
        const d = res?.data || res;
        setStores(Array.isArray(d) ? d : d.stores || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, [page, filter, search]);

  const openView = (store) => {
    setViewModal({ open: true, store: null, loading: true });
    getStore(store._id)
      .then(res => setViewModal({ open: true, store: res?.data || res, loading: false }))
      .catch(() => setViewModal({ open: true, store, loading: false }));
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendStore(confirm.id);
      else if (confirm.type === 'activate') await activateStore(confirm.id);
      else if (confirm.type === 'delete') await permanentDeleteStore(confirm.id);
      fetchStores();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  const handleTierChange = async (storeId, tier, storeName) => {
    if (!confirm(`Change ${storeName} tier to ${tier}?`)) return;
    setActionLoading(true);
    try { await changeStoreTier(storeId, tier); fetchStores(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusVariant = { active: 'success', pending: 'warning', suspended: 'danger' };

  const columns = [
    { key: 'name', label: 'Store', render: row => (
      <button onClick={() => openView(row)} className="text-violet-600 hover:underline font-medium">{row.name || 'N/A'}</button>
    )},
    { key: 'vendorId', label: 'Owner', render: row => row.vendorId?.name || '—' },
    { key: 'vendorId.email', label: 'Email', render: row => row.vendorId?.email || '—' },
    { key: 'tier', label: 'Tier', render: row => (
      <div className="flex items-center gap-0.5">
        {TIERS.map(t => (
          <button key={t} onClick={() => handleTierChange(row._id, t, row.name)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${row.tier === t ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {t.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
    )},
    { key: 'commissionRate', label: 'Commission', render: row => `${row.commissionRate || 10}%` },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'totalSales', label: 'Sales', render: row => (row.totalSales || 0).toLocaleString() },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openView(row)}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'active' && <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend', name: row.name })}><HiBan className="w-4 h-4" /></Button>}
        {row.status === 'suspended' && <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'activate', name: row.name })}><HiCheck className="w-4 h-4" /></Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', name: row.name })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'suspended', label: 'Suspended' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Stores</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search stores..." />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{f.label}</button>
        ))}
      </div>
      <Card>
        <Table columns={columns} data={stores} loading={loading} emptyMessage="No stores found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, store: null, loading: false })} title="Store Details" size="lg">
        {viewModal.loading ? (
          <div className="flex justify-center py-10"><Spinner size="md" /></div>
        ) : viewModal.store ? (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Store:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.store.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Subdomain:</span><span className="text-[var(--text-primary)]">{viewModal.store.subdomain}.marketbridge.co.ke</span></div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Tier:</span>
                <div className="flex items-center gap-1">
                  {TIERS.map(t => (
                    <button key={t} onClick={() => handleTierChange(viewModal.store._id, t, viewModal.store.name)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${viewModal.store.tier === t ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusVariant[viewModal.store.status] || 'default'}>{viewModal.store.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Description:</span><span className="text-[var(--text-primary)] text-xs">{viewModal.store.description || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Commission:</span><span className="text-[var(--text-primary)]">{viewModal.store.commissionRate || 10}%</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Rating:</span><span className="text-[var(--text-primary)]">⭐ {viewModal.store.rating || 0} ({viewModal.store.totalReviews || 0} reviews)</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total Sales:</span><span className="text-[var(--text-primary)]">{(viewModal.store.totalSales || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Joined:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.store.createdAt)}</span></div>
              {viewModal.store.subscriptionExpiry && <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Subscription Expires:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.store.subscriptionExpiry)}</span></div>}
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-[var(--text-primary)]">Owner</h3>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.phone || '—'}</span></div>
            </div>
            {viewModal.store.features && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-[var(--text-primary)]">Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="text-center"><p className="text-[var(--text-primary)] font-bold">{viewModal.store.features.maxProducts === 999999 ? '∞' : viewModal.store.features.maxProducts}</p><p className="text-xs text-[var(--text-muted)]">Max Products</p></div>
                  <div className="text-center"><Badge variant={viewModal.store.features.canCreateVouchers ? 'success' : 'default'}>{viewModal.store.features.canCreateVouchers ? '✅' : '❌'}</Badge><p className="text-xs text-[var(--text-muted)] mt-1">Vouchers</p></div>
                  <div className="text-center"><Badge variant={viewModal.store.features.canCreateHotDeals ? 'success' : 'default'}>{viewModal.store.features.canCreateHotDeals ? '✅' : '❌'}</Badge><p className="text-xs text-[var(--text-muted)] mt-1">Hot Deals</p></div>
                  <div className="text-center"><Badge variant={viewModal.store.features.canRunFlashSales ? 'success' : 'default'}>{viewModal.store.features.canRunFlashSales ? '✅' : '❌'}</Badge><p className="text-xs text-[var(--text-muted)] mt-1">Flash Sales</p></div>
                  <div className="text-center"><Badge variant={viewModal.store.features.canBoostNewArrivals ? 'success' : 'default'}>{viewModal.store.features.canBoostNewArrivals ? '✅' : '❌'}</Badge><p className="text-xs text-[var(--text-muted)] mt-1">Boost New</p></div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="danger" onClick={() => { setViewModal({ open: false, store: null, loading: false }); setConfirm({ open: true, id: viewModal.store._id, type: 'delete', name: viewModal.store.name }); }}>
                <HiTrash className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Store not found</p>
        )}
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title={confirm.type === 'suspend' ? 'Suspend Store' : confirm.type === 'activate' ? 'Activate Store' : 'Permanently Delete Store'}
        message={confirm.type === 'delete' ? `Delete ${confirm.name} and all their data? This cannot be undone.` : `${confirm.type === 'suspend' ? 'Suspend' : 'Activate'} ${confirm.name}?`}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'} loading={actionLoading} />
    </div>
  );
}