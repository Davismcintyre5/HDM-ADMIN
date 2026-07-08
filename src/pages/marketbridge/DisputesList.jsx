import { useState, useEffect } from 'react';
import { getDisputes, getDispute, mediateDispute, resolveDispute } from '../../services/marketbridge/disputes';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Modal from '../../components/marketbridge/ui/Modal';
import Pagination from '../../components/marketbridge/ui/Pagination';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiEye, HiCheck } from 'react-icons/hi';

const statusVariant = { open: 'danger', under_review: 'warning', resolved: 'success' };

export default function DisputesList() {
  const [disputes, setDisputes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [viewModal, setViewModal] = useState({ open: false, dispute: null });
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [resolveForm, setResolveForm] = useState({ resolution: '', refundAmount: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    getDisputes(params)
      .then(res => {
        const d = res?.data || res;
        setDisputes(d.disputes || d || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDisputes(); }, [page, filter]);

  const openView = async (dispute) => {
    setActionLoading(true);
    try {
      const res = await getDispute(dispute._id || dispute.id);
      setViewModal({ open: true, dispute: res?.data || res });
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleMediate = async (id) => {
    setActionLoading(true);
    try { await mediateDispute(id); fetchDisputes(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try { await resolveDispute(resolveModal.id, resolveForm); setResolveModal({ open: false, id: null }); setResolveForm({ resolution: '', refundAmount: '' }); fetchDisputes(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'orderId', label: 'Order', render: row => <span className="font-mono text-xs">{row.orderId || row.order?._id || '—'}</span> },
    { key: 'buyer', label: 'Buyer', render: row => row.buyer?.name || row.buyerName || '—' },
    { key: 'seller', label: 'Seller', render: row => row.seller?.name || row.sellerName || '—' },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status?.replace('_', ' ')}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openView(row)}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'open' && <Button size="sm" variant="warning" onClick={() => handleMediate(row._id || row.id)}>Review</Button>}
        {row.status === 'under_review' && <Button size="sm" variant="success" onClick={() => setResolveModal({ open: true, id: row._id || row.id })}><HiCheck className="w-4 h-4" /></Button>}
      </div>
    )},
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'under_review', label: 'In Review' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Disputes</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{f.label}</button>
        ))}
      </div>
      <Card>
        <Table columns={columns} data={disputes} loading={loading} emptyMessage="No disputes found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, dispute: null })} title="Dispute Details" size="lg">
        {viewModal.dispute && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Order:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.dispute.orderId}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Buyer:</span><span className="text-[var(--text-primary)]">{viewModal.dispute.buyer?.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Seller:</span><span className="text-[var(--text-primary)]">{viewModal.dispute.seller?.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusVariant[viewModal.dispute.status]}>{viewModal.dispute.status?.replace('_', ' ')}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reason:</span><span className="text-[var(--text-primary)]">{viewModal.dispute.reason}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={resolveModal.open} onClose={() => setResolveModal({ open: false, id: null })} title="Resolve Dispute" size="sm">
        <div className="space-y-4">
          <Input label="Resolution" value={resolveForm.resolution} onChange={e => setResolveForm({ ...resolveForm, resolution: e.target.value })} placeholder="e.g., Refund issued" />
          <Input label="Refund Amount (KES)" type="number" value={resolveForm.refundAmount} onChange={e => setResolveForm({ ...resolveForm, refundAmount: e.target.value })} />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setResolveModal({ open: false, id: null })}>Cancel</Button><Button variant="success" onClick={handleResolve} loading={actionLoading}>Resolve</Button></div>
        </div>
      </Modal>
    </div>
  );
}