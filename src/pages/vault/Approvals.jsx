import { useEffect, useState } from 'react';
import { getApprovals, approveActivation, rejectActivation, verifyPayment } from '../../services/vault/approvals';
import Card from '../../components/vault/ui/Card';
import Table from '../../components/vault/ui/Table';
import Badge from '../../components/vault/ui/Badge';
import Button from '../../components/vault/ui/Button';
import Modal from '../../components/vault/ui/Modal';
import Input from '../../components/vault/ui/Input';
import Pagination from '../../components/vault/ui/Pagination';
import { formatDate } from '../../utils/vault/formatDate';
import { HiEye, HiCheck, HiX, HiShieldCheck } from 'react-icons/hi';

export default function Approvals() {
  const [data, setData] = useState({ activations: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [verifyModal, setVerifyModal] = useState({ open: false, id: null });
  const [verifyForm, setVerifyForm] = useState({ amountMatch: true, accountMatch: true, dateMatch: true, txIdMatch: true, status: 'matched', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = () => {
    setLoading(true);
    getApprovals({ page, limit: 20 })
      .then(res => setData({ activations: res.activations || [], total: res.total || 0 }))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApprovals(); }, [page]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try { await approveActivation(id); fetchApprovals(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectActivation(rejectModal.id, rejectModal.reason); setRejectModal({ open: false, id: null, reason: '' }); fetchApprovals(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try { await verifyPayment(verifyModal.id, verifyForm); setVerifyModal({ open: false, id: null }); fetchApprovals(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusV = { pending: 'warning', approved: 'success', rejected: 'danger' };

  const columns = [
    { key: 'userId', label: 'User', render: (row) => row.userId?.fullName || row.userId?.email || 'N/A' },
    { key: 'orgId', label: 'Org', render: (row) => row.orgId?.name || 'N/A' },
    { key: 'planTier', label: 'Plan', render: (row) => <Badge variant="orange">{row.planTier} ({row.planType})</Badge> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">{row.amount} {row.currency}</span> },
    { key: 'paymentMethod', label: 'Method', render: (row) => <span className="text-xs capitalize">{row.paymentMethod?.replace(/_/g, ' ')}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, approval: row })}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" onClick={() => { setVerifyForm({ amountMatch: true, accountMatch: true, dateMatch: true, txIdMatch: true, status: 'matched', notes: '' }); setVerifyModal({ open: true, id: row._id }); }}><HiShieldCheck className="w-4 h-4" /></Button>
            <Button size="sm" variant="success" onClick={() => handleApprove(row._id)}><HiCheck className="w-4 h-4" /></Button>
            <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, reason: '' })}><HiX className="w-4 h-4" /></Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Approvals</h1>
      <Card>
        <Table columns={columns} data={data.activations} loading={loading} emptyMessage="No pending approvals." />
        <Pagination page={page} totalPages={Math.ceil(data.total / 20) || 1} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, approval: null })} title="Approval Details" size="md">
        {viewModal.approval && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">User:</span><span className="text-[var(--text-primary)]">{viewModal.approval.userId?.fullName}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.approval.userId?.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Org:</span><span className="text-[var(--text-primary)]">{viewModal.approval.orgId?.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="orange">{viewModal.approval.planTier}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="font-medium">{viewModal.approval.amount} {viewModal.approval.currency}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null, reason: '' })} title="Reject Activation" size="sm">
        <Input label="Reason" value={rejectModal.reason} onChange={(e) => setRejectModal(p => ({ ...p, reason: e.target.value }))} />
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setRejectModal({ open: false, id: null, reason: '' })}>Cancel</Button><Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button></div>
      </Modal>

      <Modal open={verifyModal.open} onClose={() => setVerifyModal({ open: false, id: null })} title="Verify Payment" size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={verifyForm.amountMatch} onChange={(e) => setVerifyForm(p => ({ ...p, amountMatch: e.target.checked }))} /> Amount Match</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={verifyForm.accountMatch} onChange={(e) => setVerifyForm(p => ({ ...p, accountMatch: e.target.checked }))} /> Account Match</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={verifyForm.dateMatch} onChange={(e) => setVerifyForm(p => ({ ...p, dateMatch: e.target.checked }))} /> Date Match</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={verifyForm.txIdMatch} onChange={(e) => setVerifyForm(p => ({ ...p, txIdMatch: e.target.checked }))} /> TX ID Match</label>
          </div>
          <Input label="Notes" value={verifyForm.notes} onChange={(e) => setVerifyForm(p => ({ ...p, notes: e.target.value }))} />
          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setVerifyModal({ open: false, id: null })}>Cancel</Button><Button onClick={handleVerify} loading={actionLoading}>Verify</Button></div>
        </div>
      </Modal>
    </div>
  );
}