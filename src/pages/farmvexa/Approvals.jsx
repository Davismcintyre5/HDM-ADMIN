import { useState, useEffect } from 'react';
import { getUsers } from '../../services/farmvexa/users';
import { getApprovalHistory, approveUser, rejectUser } from '../../services/farmvexa/approvals';
import { getRenewals, approveRenewal, rejectRenewal } from '../../services/farmvexa/renewals';
import { getUpgrades, approveUpgrade, rejectUpgrade } from '../../services/farmvexa/upgrades';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Modal from '../../components/farmvexa/ui/Modal';
import Pagination from '../../components/farmvexa/ui/Pagination';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiEye, HiCheck, HiX } from 'react-icons/hi';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'renewals', label: 'Renewals' },
  { key: 'upgrades', label: 'Upgrades' },
  { key: 'history', label: 'History' },
];

const statusVariant = { 
  approved: 'success', 
  rejected: 'danger', 
  completed: 'success', 
  failed: 'danger', 
  pending_verification: 'warning', 
  pending: 'warning' 
};

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [notes, setNotes] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = { page, limit: 20 };

    if (activeTab === 'pending') {
      getUsers({ ...params, approvalStatus: 'pending' })
        .then(res => {
          const users = res?.data?.users || [];
          setApprovals(users.map(u => ({
            _id: u._id,
            user: {
              _id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              county: u.county,
              subCounty: u.subCounty,
              createdAt: u.createdAt,
              selectedPlan: u.selectedPlan,
              subscriptionStatus: u.subscriptionStatus,
              subscriptionExpiry: u.subscriptionExpiry,
            },
            status: 'pending',
            createdAt: u.createdAt,
            payment: u.payment,
            selectedPlan: u.selectedPlan,
          })));
          setPagination(res?.data?.pagination || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    } else if (activeTab === 'renewals') {
      getRenewals(params)
        .then(res => {
          setApprovals(res?.data?.renewals || res?.data || []);
          setPagination(res?.data?.pagination || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    } else if (activeTab === 'upgrades') {
      getUpgrades(params)
        .then(res => {
          setApprovals(res?.data?.upgrades || res?.data || []);
          setPagination(res?.data?.pagination || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    } else {
      getApprovalHistory(params)
        .then(res => {
          setApprovals(res?.data?.approvals || []);
          setPagination(res?.data?.pagination || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const getUserId = (approval) => {
    if (activeTab === 'renewals' || activeTab === 'upgrades') return approval?._id || approval?.id;
    return approval?.user?._id || approval?._id || approval?.id;
  };

  const handleApprove = async () => {
    const id = getUserId(viewModal.approval);
    if (!id) return alert('ID not found');
    setActionLoading(true);
    try {
      if (activeTab === 'renewals') await approveRenewal(id);
      else if (activeTab === 'upgrades') await approveUpgrade(id, { notes });
      else await approveUser(id, { notes });
      setViewModal({ open: false, approval: null }); 
      setNotes(''); 
      setTimeout(() => fetchData(), 500);
    }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const openReject = () => {
    const id = getUserId(viewModal.approval);
    const name = viewModal.approval?.user?.name || viewModal.approval?.farmer?.name || '';
    setRejectModal({ open: true, id, name });
  };

  const handleReject = async () => {
    if (!rejectModal.id) return alert('ID not found');
    setActionLoading(true);
    try {
      if (activeTab === 'renewals') await rejectRenewal(rejectModal.id, { reason: rejectReason, notes });
      else if (activeTab === 'upgrades') await rejectUpgrade(rejectModal.id, { reason: rejectReason, notes });
      else await rejectUser(rejectModal.id, { reason: rejectReason, notes });
      setRejectModal({ open: false, id: null, name: '' });
      setNotes('');
      setViewModal({ open: false, approval: null });
      setTimeout(() => fetchData(), 500);
    }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => { setViewModal({ open: true, approval: row }); setNotes(''); }} className="text-emerald-600 hover:underline font-medium">
        {row.user?.name || row.farmer?.name || row.name}
      </button>
    )},
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.user?.email || row.farmer?.email || row.email}</span> },
    { key: 'phone', label: 'Phone', render: row => <span className="text-sm">{row.user?.phone || row.farmer?.phone || row.phone || '—'}</span> },
    { key: 'plan', label: 'Plan', render: row => {
      if (activeTab === 'upgrades') {
        return (
          <div className="text-xs">
            <Badge variant="default">{row.oldPlan || '—'}</Badge>
            <span className="mx-1 text-[var(--text-muted)]">→</span>
            <Badge variant="info">{row.newPlan || row.plan || '—'}</Badge>
          </div>
        );
      }
      return <Badge variant="info">{row.plan || row.selectedPlan || row.planName || row.user?.selectedPlan || '—'}</Badge>;
    }},
    { key: 'payment', label: 'Payment', render: row => {
      const amount = row.amount || row.payment?.amount;
      const method = row.paymentMethod || row.payment?.methodType;
      const reference = row.paymentReference || row.payment?.reference;
      return amount ? (
        <div className="text-xs">
          <span className="text-[var(--text-primary)] font-medium">KES {amount}</span>
          {method && <span className="text-[var(--text-muted)] ml-1">· {method}</span>}
          {reference && <span className="text-[var(--text-muted)] ml-1">· {reference}</span>}
        </div>
      ) : <span className="text-sm text-[var(--text-muted)]">—</span>;
    }},
    { key: 'status', label: 'Status', render: row => {
      if (activeTab === 'history') {
        return <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>;
      }
      const paymentStatus = row.payment?.status || row.status || 'pending_verification';
      const label = paymentStatus === 'completed' ? 'Paid' : paymentStatus === 'failed' ? 'Failed' : paymentStatus === 'pending_verification' ? 'Pending Payment' : paymentStatus;
      const variant = paymentStatus === 'completed' ? 'success' : paymentStatus === 'failed' ? 'danger' : 'warning';
      return <Badge variant={variant}>{label}</Badge>;
    }},
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt || row.user?.createdAt || row.renewalDate) },
    { key: 'actions', label: '', render: row => (
      <Button size="sm" variant="secondary" onClick={() => { setViewModal({ open: true, approval: row }); setNotes(''); }}><HiEye className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Approvals</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={approvals} loading={loading} emptyMessage={`No ${activeTab} approvals.`} />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* Review Modal */}
      <Modal open={viewModal.open} onClose={() => { setViewModal({ open: false, approval: null }); setNotes(''); }} title="Approval Review" size="lg">
        {viewModal.approval && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.approval.user?.name || viewModal.approval.farmer?.name} bold />
              <Row label="Email" value={viewModal.approval.user?.email || viewModal.approval.farmer?.email} />
              <Row label="Phone" value={viewModal.approval.user?.phone || viewModal.approval.farmer?.phone} />
              {viewModal.approval.user?.county && <Row label="County" value={viewModal.approval.user?.county} />}
              {viewModal.approval.user?.subCounty && <Row label="Sub-County" value={viewModal.approval.user?.subCounty} />}
              <Row label="Registered" value={formatDate(viewModal.approval.user?.createdAt || viewModal.approval.createdAt, 'full')} />
            </div>

            {activeTab === 'renewals' && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Renewal Details</h3>
                <Row label="Plan" value={viewModal.approval.plan || viewModal.approval.user?.selectedPlan} />
                <Row label="Amount" value={`KES ${viewModal.approval.amount}`} />
                <Row label="Method" value={viewModal.approval.paymentMethod} />
                <Row label="Reference" value={viewModal.approval.paymentReference} />
                <Row label="Expiry" value={formatDate(viewModal.approval.user?.subscriptionExpiry)} />
              </div>
            )}

            {activeTab === 'upgrades' && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Upgrade Details</h3>
                <Row label="Current Plan" value={viewModal.approval.oldPlan} />
                <Row label="New Plan" value={viewModal.approval.newPlan || viewModal.approval.plan} />
                <Row label="Amount" value={`KES ${viewModal.approval.amount}`} />
                <Row label="Method" value={viewModal.approval.paymentMethod} />
                <Row label="Reference" value={viewModal.approval.paymentReference} />
              </div>
            )}

            {activeTab === 'pending' && viewModal.approval.payment && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Payment Details</h3>
                <Row label="Plan" value={viewModal.approval.payment.plan || viewModal.approval.selectedPlan} />
                <Row label="Amount" value={`KES ${viewModal.approval.payment.amount}`} />
                <Row label="Method" value={viewModal.approval.payment.methodType} />
                <Row label="Reference" value={viewModal.approval.payment.reference} />
                <Row label="Status" value={viewModal.approval.payment.status} />
              </div>
            )}

            {(activeTab === 'pending' || activeTab === 'renewals' || activeTab === 'upgrades') && (
              <>
                <Input label="Admin Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." />
                <div className="flex justify-end gap-2">
                  <Button variant="danger" onClick={openReject}><HiX className="w-4 h-4 mr-1" /> Reject</Button>
                  <Button variant="success" onClick={handleApprove} loading={actionLoading}><HiCheck className="w-4 h-4 mr-1" /> Approve</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject — ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>Reject</Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span>
    </div>
  );
}