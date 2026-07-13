import { useState, useEffect } from 'react';
import { getApprovals, getNewApprovals, getRenewals, approveApproval, rejectApproval, bulkApprove } from '../../services/bizhub/approvals';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Input from '../../components/bizhub/ui/Input';
import Modal from '../../components/bizhub/ui/Modal';
import Pagination from '../../components/bizhub/ui/Pagination';
import Spinner from '../../components/bizhub/ui/Spinner';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiEye, HiCheck, HiX, HiUserAdd, HiRefresh } from 'react-icons/hi';

const MODULE_ICONS = {
  pharma: '💊', resto: '🍽️', apartment: '🏢', electro: '🔌', cyber: '💻',
  pharmasys: '💊', restomanagerke: '🍽️', myapartment: '🏢', electrostore: '🔌', digitalmanager: '💻',
};

const TABS = [
  { key: 'new', label: 'New Registrations', icon: HiUserAdd },
  { key: 'renewal', label: 'Renewals', icon: HiRefresh },
];

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('new');
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, approval: null });

  const fetchApprovals = () => {
    setLoading(true);
    setSelected([]);
    const params = { page, limit: 20 };
    const fetcher = activeTab === 'new' ? getNewApprovals : getRenewals;
    fetcher(params)
      .then(res => {
        const d = res?.data || res;
        setApprovals(Array.isArray(d) ? d : d.approvals || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(() => {
        // Fallback to main approvals endpoint
        getApprovals(params).then(res => {
          const d = res?.data || res;
          const all = Array.isArray(d) ? d : d.approvals || [];
          setApprovals(all.filter(a => activeTab === 'new' ? a.type !== 'renewal' : a.type === 'renewal'));
          setPagination(d.pagination || { page: 1, pages: 1 });
        }).catch(console.error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApprovals(); }, [page, activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try { await approveApproval(id, { plan: 'standard', modules: [] }); fetchApprovals(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectApproval(rejectModal.id, rejectReason); setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); fetchApprovals(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleBulkApprove = async () => {
    if (selected.length === 0) return alert('Select approvals');
    setActionLoading(true);
    try { await bulkApprove(selected, 'standard'); setSelected([]); fetchApprovals(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const getModuleName = (row) => {
    if (row.moduleName) return row.moduleName;
    if (row.modules?.length > 0) {
      const mod = row.modules[0];
      if (typeof mod === 'string') return mod;
      return mod.moduleName || mod.name || mod.type || null;
    }
    if (row.businessType) return row.businessType;
    return null;
  };

  const getModuleIcon = (row) => {
    const name = getModuleName(row);
    if (!name) return '';
    const key = name.toLowerCase().replace(/\s+/g, '');
    return MODULE_ICONS[key] || '';
  };

  const renderModule = (mod) => {
    if (typeof mod === 'string') return mod;
    return mod.moduleName || mod.name || mod.type || 'Unknown';
  };

  const columns = [
    {
      key: 'businessName', label: 'Business',
      render: row => (
        <button onClick={() => setViewModal({ open: true, approval: row })} className="text-teal-600 hover:underline font-medium">
          {row.businessName || 'N/A'}
        </button>
      ),
    },
    { key: 'owner', label: 'Owner', render: row => row.owner?.name || '—' },
    {
      key: 'planInfo', label: 'Plan',
      render: row => (
        <div>
          <span className="font-medium text-[var(--text-primary)]">{row.planInfo?.name || row.planName || 'N/A'}</span>
          <span className="text-xs text-[var(--text-muted)] ml-1">KES {(row.planInfo?.amount || row.planAmount || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'modules', label: 'Module',
      render: row => {
        const name = getModuleName(row);
        const icon = getModuleIcon(row);
        return name ? <Badge variant="teal">{icon} {name}</Badge> : <span className="text-[var(--text-muted)]">—</span>;
      },
    },
    { key: 'createdAt', label: 'Applied', render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, approval: row })}><HiEye className="w-4 h-4" /></Button>
          <Button size="sm" variant="success" onClick={() => { if (window.confirm(`Approve ${row.businessName}?`)) handleApprove(row._id); }}><HiCheck className="w-4 h-4" /> Approve</Button>
          <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, name: row.businessName })}><HiX className="w-4 h-4" /> Reject</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Approvals</h1>
        {selected.length > 0 && (
          <Button size="sm" variant="success" onClick={handleBulkApprove} loading={actionLoading}>
            Bulk Approve ({selected.length})
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-teal-600 text-teal-600 dark:text-teal-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={approvals} loading={loading} emptyMessage={`No ${activeTab === 'new' ? 'new registrations' : 'renewals'} found.`} />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, approval: null })} title="Approval Details" size="xl">
        {viewModal.approval ? (
          <div className="space-y-6 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.approval.businessName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Slug:</span><span className="text-[var(--text-primary)] text-xs">{viewModal.approval.slug || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type:</span><Badge variant="teal">{viewModal.approval.businessType || '—'}</Badge></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant="warning">{viewModal.approval.status || 'pending'}</Badge></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Applied:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.approval.createdAt, 'full')}</span></div>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Owner</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.approval.owner?.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.approval.owner?.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.approval.owner?.phone || '—'}</span></div>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Selected Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="teal">{viewModal.approval.planInfo?.name || 'N/A'}</Badge></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">KES {(viewModal.approval.planInfo?.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Cycle:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.approval.planInfo?.cycle || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Payment:</span><span className="text-[var(--text-primary)] capitalize">{(viewModal.approval.planInfo?.paymentMethod || '—').replace(/_/g, ' ')}</span></div>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Selected Modules</h3>
              {viewModal.approval.modules?.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {viewModal.approval.modules.map((m, i) => <Badge key={i} variant="teal">{renderModule(m)}</Badge>)}
                </div>
              ) : getModuleName(viewModal.approval) ? (
                <Badge variant="teal">{getModuleIcon(viewModal.approval)} {getModuleName(viewModal.approval)}</Badge>
              ) : (
                <p className="text-[var(--text-muted)] text-xs">No module selected</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Approval not found</p>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
        <div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button><Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button></div>
      </Modal>
    </div>
  );
}