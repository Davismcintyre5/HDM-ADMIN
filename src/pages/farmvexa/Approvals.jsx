import { useState, useEffect } from 'react';
import { getPendingApprovals, approveUser, rejectUser, getApprovalHistory } from '../../services/farmvexa/approvals';
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
  { key: 'history', label: 'History' },
];

const statusVariant = { approved: 'success', rejected: 'danger' };

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
    const fetcher = activeTab === 'pending' ? getPendingApprovals : () => getApprovalHistory(params);
    fetcher(params)
      .then(res => {
        setApprovals(res?.data?.approvals || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const getUserId = (approval) => approval?.user?._id || approval?.user?.id || approval?._id || approval?.id;

  const handleApprove = async () => {
    const id = getUserId(viewModal.approval);
    if (!id) return alert('User ID not found');
    setActionLoading(true);
    try { await approveUser(id, { notes }); setViewModal({ open: false, approval: null }); setNotes(''); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const openReject = () => {
    const id = getUserId(viewModal.approval);
    const name = viewModal.approval?.user?.name || viewModal.approval?.name || '';
    setRejectModal({ open: true, id, name });
  };

  const handleReject = async () => {
    if (!rejectModal.id) return alert('User ID not found');
    setActionLoading(true);
    try { await rejectUser(rejectModal.id, { reason: rejectReason, notes }); setRejectModal({ open: false, id: null, name: '' }); setNotes(''); setViewModal({ open: false, approval: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => { setViewModal({ open: true, approval: row }); setNotes(''); }} className="text-emerald-600 hover:underline font-medium">
        {row.user?.name || row.name}
      </button>
    )},
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.user?.email || row.email}</span> },
    { key: 'county', label: 'County', render: row => <span className="text-sm">{row.user?.county || row.county || '—'}</span> },
    { key: 'status', label: 'Status', render: row => activeTab === 'history' ? <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> : <Badge variant="warning">Pending</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt || row.user?.createdAt) },
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

      {/* View/Review Modal */}
      <Modal open={viewModal.open} onClose={() => { setViewModal({ open: false, approval: null }); setNotes(''); }} title="Approval Review" size="lg">
        {viewModal.approval && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.approval.user?.name || viewModal.approval.name} bold />
              <Row label="Email" value={viewModal.approval.user?.email || viewModal.approval.email} />
              <Row label="Phone" value={viewModal.approval.user?.phone || viewModal.approval.phone} />
              <Row label="County" value={viewModal.approval.user?.county || viewModal.approval.county} />
              <Row label="Sub-County" value={viewModal.approval.user?.subCounty || viewModal.approval.subCounty} />
              <Row label="Registered" value={formatDate(viewModal.approval.user?.createdAt || viewModal.approval.createdAt, 'full')} />
              {viewModal.approval.reviewedBy && <Row label="Reviewed By" value={viewModal.approval.reviewedBy?.name} />}
              {viewModal.approval.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 font-medium text-xs">Rejection Reason:</span>
                  <p className="text-red-700 dark:text-red-300 text-xs mt-1">{viewModal.approval.rejectionReason}</p>
                </div>
              )}
            </div>
            {activeTab === 'pending' && (
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