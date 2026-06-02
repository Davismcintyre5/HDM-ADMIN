import { useEffect, useState } from 'react';
import { getPendingVerifications, approveVerification, rejectVerification } from '../../services/vibe/verification';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Modal from '../../components/vibe/ui/Modal';
import Input from '../../components/vibe/ui/Input';
import Pagination from '../../components/vibe/ui/Pagination';
import { formatDate } from '../../utils/vibe/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';

export default function Verification() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getPendingVerifications({ page, limit: 20 })
      .then(res => {
        setItems(res.data || []);
        setMeta({ total: res.total || 0, page: res.page || 1, pages: res.pages || 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleApprove = async (id) => {
    try { await approveVerification(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectVerification(rejectModal.id, rejectModal.reason); setRejectModal({ open: false, id: null, reason: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'user', label: 'User', render: (row) => row.user?.username || row.user?.email || 'N/A' },
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="gradient">{row.plan}</Badge> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">${row.amount}</span> },
    { key: 'method', label: 'Method', render: (row) => <span className="text-xs capitalize">{row.method}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="success" onClick={() => handleApprove(row._id)}><HiCheck className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, reason: '' })}><HiX className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Verification Requests</h1>
      <Card>
        <Table columns={columns} data={items} loading={loading} emptyMessage="No pending verifications." />
        <Pagination page={page} totalPages={meta.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null, reason: '' })} title="Reject Verification" size="sm">
        <div className="space-y-4">
          <Input label="Reason" value={rejectModal.reason} onChange={(e) => setRejectModal(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for rejection" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ open: false, id: null, reason: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}