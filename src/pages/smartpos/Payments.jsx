import { useEffect, useState } from 'react';
import { getAllPayments, approvePayment, rejectPayment, deletePayment, deleteAllApproved, deleteAllRejected } from '../../services/smartpos/payments';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Modal from '../../components/smartpos/ui/Modal';
import Input from '../../components/smartpos/ui/Input';
import Pagination from '../../components/smartpos/ui/Pagination';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiEye, HiCheck, HiX, HiTrash, HiUserAdd, HiRefresh } from 'react-icons/hi';

const TABS = [
  { key: 'all', label: 'All', icon: null },
  { key: 'new', label: 'New Payments', icon: HiUserAdd },
  { key: 'renewal', label: 'Renewals', icon: HiRefresh },
];

export default function Payments() {
  const [data, setData] = useState({ payments: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [confirmApprove, setConfirmApprove] = useState({ open: false, id: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, type: 'single' });
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    getAllPayments()
      .then(res => setData({ payments: res.payments || [], count: res.count || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const isRenewal = (payment) => payment.reference?.startsWith('RNW-');

  // Filter by tab
  const tabFiltered = activeTab === 'all'
    ? data.payments
    : activeTab === 'renewal'
      ? data.payments.filter(p => isRenewal(p))
      : data.payments.filter(p => !isRenewal(p));

  const counts = {
    all: data.payments.length,
    new: data.payments.filter(p => !isRenewal(p)).length,
    renewal: data.payments.filter(p => isRenewal(p)).length,
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try { await approvePayment(confirmApprove.id); setConfirmApprove({ open: false, id: null }); fetchPayments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectPayment(rejectModal.id, reason); setRejectModal({ open: false, id: null }); setReason(''); fetchPayments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      if (confirmDelete.type === 'single') await deletePayment(confirmDelete.id);
      else if (confirmDelete.type === 'approved') await deleteAllApproved();
      else if (confirmDelete.type === 'rejected') await deleteAllRejected();
      setConfirmDelete({ open: false, id: null, type: 'single' });
      fetchPayments();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger', completed: 'success' };
  const approvedCount = data.payments.filter(p => p.status === 'approved').length;
  const rejectedCount = data.payments.filter(p => p.status === 'rejected').length;

  const columns = [
    {
      key: 'type', label: 'Type',
      render: (row) => isRenewal(row)
        ? <Badge variant="info"><HiRefresh className="w-3 h-3 inline mr-0.5" /> Renewal</Badge>
        : <Badge variant="success"><HiUserAdd className="w-3 h-3 inline mr-0.5" /> New</Badge>,
    },
    { key: 'client.businessName', label: 'Client', render: (row) => row.client?.businessName || 'N/A' },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">KES {row.amount?.toLocaleString()}</span> },
    { key: 'method', label: 'Method', render: (row) => <span className="capitalize text-xs">{row.method?.replace(/_/g, ' ')}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}><HiEye className="w-4 h-4" /></Button>
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" onClick={() => setConfirmApprove({ open: true, id: row._id })}><HiCheck className="w-4 h-4" /></Button>
              <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id })}><HiX className="w-4 h-4" /></Button>
            </>
          )}
          {(row.status === 'approved' || row.status === 'rejected' || row.status === 'completed') && (
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, type: 'single' })}><HiTrash className="w-4 h-4" /></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Payments</h1>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-3 mb-4">
        {approvedCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setConfirmDelete({ open: true, id: null, type: 'approved' })}>
            <HiTrash className="w-4 h-4 mr-1" /> Delete All Approved ({approvedCount})
          </Button>
        )}
        {rejectedCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setConfirmDelete({ open: true, id: null, type: 'rejected' })}>
            <HiTrash className="w-4 h-4 mr-1" /> Delete All Rejected ({rejectedCount})
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            <span className="text-xs text-[var(--text-muted)]">({counts[tab.key] || 0})</span>
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={tabFiltered} loading={loading} emptyMessage="No payments found." />
        <Pagination page={page} totalPages={Math.ceil(tabFiltered.length / 10) || 1} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, payment: null })} title="Payment Details" size="md">
        {viewModal.payment && (
          <div className="space-y-3 text-sm">
            {isRenewal(viewModal.payment) && (
              <Badge variant="info"><HiRefresh className="w-3 h-3 inline mr-1" /> Renewal Payment</Badge>
            )}
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Client:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.payment.client?.businessName || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.payment.client?.email || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">KES {viewModal.payment.amount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Method:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.payment.method?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Billing:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.payment.billingCycle}</span></div>
              {viewModal.payment.reference && <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reference:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.payment.reference}</span></div>}
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusVariant[viewModal.payment.status]}>{viewModal.payment.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Date:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.payment.createdAt, 'full')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null }); setReason(''); }} title="Reject Payment">
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" />
        <div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null }); setReason(''); }}>Cancel</Button><Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button></div>
      </Modal>

      {/* Confirm Approve */}
      <ConfirmDialog open={confirmApprove.open} onClose={() => setConfirmApprove({ open: false, id: null })} title="Approve Payment" message="Confirm this payment?" confirmLabel="Approve" variant="success" onConfirm={handleApprove} loading={actionLoading} />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, type: 'single' })}
        title={confirmDelete.type === 'single' ? 'Delete Payment' : confirmDelete.type === 'approved' ? 'Delete All Approved' : 'Delete All Rejected'}
        message={confirmDelete.type === 'single' ? 'Delete this payment?' : `Delete ALL ${confirmDelete.type} payments? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}