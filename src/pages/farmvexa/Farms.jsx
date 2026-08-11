import { useState, useEffect } from 'react';
import { getFarms, suspendFarm, updateSubscription } from '../../services/farmvexa/farms';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import SearchBar from '../../components/farmvexa/ui/SearchBar';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Modal from '../../components/farmvexa/ui/Modal';
import Pagination from '../../components/farmvexa/ui/Pagination';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const statusVariant = { active: 'success', inactive: 'danger', suspended: 'warning' };

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, farm: null });
  const [suspendModal, setSuspendModal] = useState({ open: false, id: null, name: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [tierModal, setTierModal] = useState({ open: false, id: null, tier: '' });

  const fetchFarms = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    if (search) params.search = search;
    getFarms(params)
      .then(res => {
        setFarms(res?.data?.farms || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchFarms(); }, [page, filter, search]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendFarm(suspendModal.id, { notes: suspendReason }); setSuspendModal({ open: false, id: null, name: '' }); fetchFarms(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleTierChange = async () => {
    setActionLoading(true);
    try { await updateSubscription(tierModal.id, { tier: tierModal.tier }); setTierModal({ open: false, id: null, tier: '' }); fetchFarms(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Farm Name', render: row => (
      <button onClick={() => setViewModal({ open: true, farm: row })} className="text-emerald-600 hover:underline font-medium">{row.name}</button>
    )},
    { key: 'owner', label: 'Owner', render: row => <span className="text-sm">{row.owner?.name || '—'}</span> },
    { key: 'county', label: 'Location', render: row => <span className="text-sm">{row.location?.county || '—'}</span> },
    { key: 'size', label: 'Size', render: row => <span className="text-sm">{row.size?.value} {row.size?.unit}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, farm: row })}><HiEye className="w-3 h-3" /></Button>
        <Button size="sm" variant="warning" onClick={() => { setSuspendReason(''); setSuspendModal({ open: true, id: row.id || row._id, name: row.name }); }}>Suspend</Button>
        <Button size="sm" variant="info" onClick={() => setTierModal({ open: true, id: row.id || row._id, tier: row.subscriptionTier || 'free' })}>Tier</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Farms</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search farms..." />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={farms} loading={loading} emptyMessage="No farms found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View Farm Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, farm: null })} title="Farm Details" size="lg">
        {viewModal.farm && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Farm Name" value={viewModal.farm.name} bold />
              <Row label="Owner" value={viewModal.farm.owner?.name} />
              <Row label="Email" value={viewModal.farm.owner?.email} />
              <Row label="County" value={viewModal.farm.location?.county} />
              <Row label="Sub-County" value={viewModal.farm.location?.subCounty} />
              <Row label="Size" value={`${viewModal.farm.size?.value} ${viewModal.farm.size?.unit}`} />
              <Row label="Status" value={viewModal.farm.status} />
              <Row label="Subscription" value={viewModal.farm.subscriptionTier || viewModal.farm.management?.subscriptionTier} />
              <Row label="Created" value={formatDate(viewModal.farm.createdAt, 'full')} />
            </div>

            {viewModal.farm.fields?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Fields ({viewModal.farm.fields.length})</h3>
                <div className="space-y-1">
                  {viewModal.farm.fields.map((field, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-secondary)] rounded">
                      <span className="text-[var(--text-primary)]">{field.name}</span>
                      <span className="text-[var(--text-muted)]">{field.crop} · {field.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewModal.farm.devices?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Devices ({viewModal.farm.devices.length})</h3>
                <div className="space-y-1">
                  {viewModal.farm.devices.map((device, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-secondary)] rounded">
                      <span className="text-[var(--text-primary)]">{device.name}</span>
                      <Badge variant={device.status === 'online' ? 'success' : 'danger'}>{device.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Suspend Modal */}
      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, id: null, name: '' })} title={`Suspend Farm: ${suspendModal.name}`}>
        <p className="text-sm text-[var(--text-muted)] mb-4">This will deactivate the farm, stop sensor monitoring, and pause all alerts. The owner can still view data.</p>
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSuspendModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Confirm Suspend</Button>
        </div>
      </Modal>

      {/* Tier Modal */}
      <Modal open={tierModal.open} onClose={() => setTierModal({ open: false, id: null, tier: '' })} title="Change Subscription" size="sm">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tier</label>
          <select value={tierModal.tier} onChange={e => setTierModal({ ...tierModal, tier: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            {['free', 'basic', 'premium'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setTierModal({ open: false, id: null, tier: '' })}>Cancel</Button>
          <Button onClick={handleTierChange} loading={actionLoading}>Update</Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span>}
    </div>
  );
}