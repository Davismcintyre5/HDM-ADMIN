import { useState, useEffect } from 'react';
import { getPendingActivations, approveActivation, rejectActivation } from '../../services/hdmnet/pendingActivations';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Input from '../../components/hdmnet/ui/Input';
import Modal from '../../components/hdmnet/ui/Modal';
import Pagination from '../../components/hdmnet/ui/Pagination';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';

export default function PendingActivations() {
  const [pending, setPending] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = () => {
    setLoading(true);
    getPendingActivations({ page, limit: 20, status: 'pending' })
      .then(res => {
        setPending(res?.data?.pending || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, [page]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this provider?')) return;
    setActionLoading(true);
    try { await approveActivation(id); fetchPending(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectActivation(rejectModal.id, { reason: rejectReason }); setRejectModal({ open: false, id: null, name: '' }); fetchPending(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Business Name', render: row => <span className="font-medium text-sm">{row.businessName || row.name}</span> },
    { key: 'owner', label: 'Owner', render: row => <span className="text-sm">{row.owner?.name || row.ownerName}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || row.owner?.email}</span> },
    { key: 'phone', label: 'Phone', render: row => <span className="text-sm">{row.phone || row.owner?.phone}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="success" onClick={() => handleApprove(row._id || row.id)}><HiCheck className="w-3 h-3" /> Approve</Button>
        <Button size="sm" variant="danger" onClick={() => { setRejectReason(''); setRejectModal({ open: true, id: row._id || row.id, name: row.businessName || row.name }); }}><HiX className="w-3 h-3" /> Reject</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pending Activations</h1>
      <Card>
        <Table columns={columns} data={pending} loading={loading} emptyMessage="No pending activations." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject - ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>Reject</Button>
        </div>
      </Modal>
    </div>
  );
}