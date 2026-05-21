import { useEffect, useState } from 'react';
import { getApprovals, approvePayment, rejectPayment, deleteApproval } from '../../services/hdmerp/approvals';
import Card from '../../components/hdmerp/ui/Card';
import Table from '../../components/hdmerp/ui/Table';
import Badge from '../../components/hdmerp/ui/Badge';
import Button from '../../components/hdmerp/ui/Button';
import Modal from '../../components/hdmerp/ui/Modal';
import Input from '../../components/hdmerp/ui/Input';
import SearchBar from '../../components/hdmerp/ui/SearchBar';
import Pagination from '../../components/hdmerp/ui/Pagination';
import ConfirmDialog from '../../components/hdmerp/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmerp/formatDate';
import { HiEye, HiX, HiCheck, HiKey, HiClipboardCopy, HiTrash } from 'react-icons/hi';

const CURRENCY_SYMBOLS = { KSh: 'KSh', USD: '$', EUR: '€', GBP: '£' };
function formatPrice(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency || '';
  if (currency === 'KSh') return `KSh ${amount?.toLocaleString() || 0}`;
  return `${symbol}${amount || 0}`;
}

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [confirmApprove, setConfirmApprove] = useState({ open: false, id: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [licenseKeys, setLicenseKeys] = useState({});

  const fetchApprovals = () => {
    setLoading(true);
    getApprovals()
      .then(setApprovals)
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApprovals(); }, []);

  const filtered = approvals.filter(a =>
    a.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    a.contactEmail?.toLowerCase().includes(search.toLowerCase()) ||
    a.paymentMethod?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const result = await approvePayment(confirmApprove.id);
      if (result?.licenseKey) {
        setLicenseKeys(prev => ({ ...prev, [confirmApprove.id]: result.licenseKey }));
      }
      setConfirmApprove({ open: false, id: null });
      fetchApprovals();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectPayment(rejectModal.id, reason);
      setRejectModal({ open: false, id: null });
      setReason('');
      fetchApprovals();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteApproval(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchApprovals();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const getLicenseKey = (approval) => {
    return approval.licenseKey || licenseKeys[approval._id];
  };

  const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' };
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  const columns = [
    { key: 'companyName', label: 'Company', render: (row) => (
      <button onClick={() => setViewModal({ open: true, approval: row })}
        className="text-green-600 hover:underline font-medium text-left">
        {row.companyName || 'N/A'}
      </button>
    )},
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="info">{row.plan}</Badge> },
    { key: 'amount', label: 'Amount', render: (row) => (
      <span className="font-medium text-[var(--text-primary)]">
        {formatPrice(row.displayAmount ?? row.amount, row.displayCurrency || row.currency)}
      </span>
    )},
    { key: 'paymentMethod', label: 'Method', render: (row) => (
      <span className="text-xs capitalize">{row.paymentMethod?.replace(/_/g, ' ')}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, approval: row })} title="View details">
          <HiEye className="w-4 h-4" />
        </Button>
        {row.status === 'pending' && (
          <>
            <Button size="sm" variant="success" onClick={() => setConfirmApprove({ open: true, id: row._id })} title="Approve">
              <HiCheck className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id })} title="Reject">
              <HiX className="w-4 h-4" />
            </Button>
          </>
        )}
        {(row.status === 'approved' || row.status === 'rejected') && (
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })} title="Delete">
            <HiTrash className="w-4 h-4" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-[var(--text-muted)]">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</p>
          <p className="text-xs text-[var(--text-muted)]">Approved</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
          <p className="text-xs text-[var(--text-muted)]">Rejected</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Approvals</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by company, email, method..." />
      </div>

      <Card>
        <Table columns={columns} data={paged} loading={loading} emptyMessage="No approvals found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, approval: null })} title="Approval Details" size="lg">
        {viewModal.approval && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Company</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.approval.companyName || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.approval.contactEmail || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Tenant ID:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.approval.tenant || 'N/A'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Payment Details</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="info">{viewModal.approval.plan}</Badge></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Billing:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.approval.billingCycle}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">{formatPrice(viewModal.approval.displayAmount ?? viewModal.approval.amount, viewModal.approval.displayCurrency || viewModal.approval.currency)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Currency:</span><span className="text-[var(--text-primary)]">{viewModal.approval.displayCurrency || viewModal.approval.currency}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Method:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.approval.paymentMethod?.replace(/_/g, ' ')}</span></div>
                {viewModal.approval.transactionId && (
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Transaction:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.approval.transactionId}</span></div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Status</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Status:</span>
                  <Badge variant={statusVariant[viewModal.approval.status] || 'default'}>{viewModal.approval.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Payment Confirmed:</span>
                  <span className={viewModal.approval.paymentConfirmed ? 'text-green-600' : 'text-yellow-600'}>
                    {viewModal.approval.paymentConfirmed ? 'Yes' : 'No'}
                  </span>
                </div>

                {getLicenseKey(viewModal.approval) && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2 mb-1">
                      <HiKey className="w-4 h-4 text-purple-500" />
                      <span className="text-[var(--text-secondary)] text-xs">License Key:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded text-xs text-[var(--text-primary)] select-all break-all">
                        {getLicenseKey(viewModal.approval)}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getLicenseKey(viewModal.approval));
                          alert('License key copied!');
                        }}
                        className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                        title="Copy"
                      >
                        <HiClipboardCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {viewModal.approval.rejectionReason && (
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                    <span className="text-[var(--text-secondary)] text-xs">Rejection Reason:</span>
                    <p className="text-red-500 text-sm mt-1">{viewModal.approval.rejectionReason}</p>
                  </div>
                )}

                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Created:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.approval.createdAt, 'full')}</span></div>
                {viewModal.approval.expiresAt && (
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Expires:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.approval.expiresAt, 'DD/MM/YYYY')}</span></div>
                )}
                {viewModal.approval.reviewedAt && (
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reviewed:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.approval.reviewedAt, 'full')}</span></div>
                )}
              </div>
            </div>

            {viewModal.approval.proofFile && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Payment Proof</h3>
                <a href={viewModal.approval.proofFile} target="_blank" rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm flex items-center gap-1">
                  View proof file ↗
                </a>
              </div>
            )}

            {viewModal.approval.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
                <Button variant="danger" onClick={() => {
                  setViewModal({ open: false, approval: null });
                  setRejectModal({ open: true, id: viewModal.approval._id });
                }}>Reject</Button>
                <Button variant="success" onClick={() => {
                  setViewModal({ open: false, approval: null });
                  setConfirmApprove({ open: true, id: viewModal.approval._id });
                }}>Approve</Button>
              </div>
            )}

            {viewModal.approval.status !== 'pending' && (
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
                <Button variant="danger" onClick={() => {
                  setViewModal({ open: false, approval: null });
                  setConfirmDelete({ open: true, id: viewModal.approval._id });
                }}>
                  <HiTrash className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null }); setReason(''); }} title="Reject Payment">
        <p className="text-sm text-[var(--text-secondary)] mb-4">Please provide a reason for rejecting this payment.</p>
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Payment not received" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null }); setReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject Payment</Button>
        </div>
      </Modal>

      {/* Confirm Approve */}
      <ConfirmDialog
        open={confirmApprove.open}
        onClose={() => setConfirmApprove({ open: false, id: null })}
        title="Approve Payment"
        message="Are you sure you want to approve this payment? A license key will be generated."
        confirmLabel="Approve"
        variant="success"
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Approval"
        message="Remove this approval from the list? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}