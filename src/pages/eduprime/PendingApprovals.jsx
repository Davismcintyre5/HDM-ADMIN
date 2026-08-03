import { useState, useEffect } from 'react';
import { getPendingSchools, approveSchool, rejectSchool } from '../../services/eduprime/pendingSchools';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Modal from '../../components/eduprime/ui/Modal';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiCheck, HiX, HiEye } from 'react-icons/hi';

export default function PendingApprovals() {
  const [pending, setPending] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, school: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = () => {
    setLoading(true);
    getPendingSchools({ page, limit: 20 })
      .then(res => {
        setPending(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, [page]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this school?')) return;
    setActionLoading(true);
    try { await approveSchool(id); fetchPending(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectSchool(rejectModal.id, rejectReason); setRejectModal({ open: false, id: null, name: '' }); fetchPending(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'School', render: row => (
      <button onClick={() => setViewModal({ open: true, school: row })} className="text-amber-600 hover:underline font-medium">{row.name}</button>
    )},
    { key: 'county', label: 'County', render: row => row.county || '—' },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type}</Badge> },
    { key: 'adminEmail', label: 'Admin Email', render: row => <span className="text-sm">{row.adminEmail}</span> },
    { key: 'createdAt', label: 'Requested', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, school: row })}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="success" onClick={() => handleApprove(row._id)}><HiCheck className="w-4 h-4" /> Approve</Button>
        <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, name: row.name })}><HiX className="w-4 h-4" /> Reject</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pending Approvals</h1>
      <Card>
        <Table columns={columns} data={pending} loading={loading} emptyMessage="No pending approvals." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, school: null })} title="School Details" size="lg">
        {viewModal.school && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            <Row label="Name" value={viewModal.school.name} bold />
            <Row label="Country" value={viewModal.school.country} />
            <Row label="County" value={viewModal.school.county} />
            <Row label="Constituency" value={viewModal.school.constituency} />
            <Row label="Town" value={viewModal.school.town} />
            <Row label="Location" value={viewModal.school.location} />
            <Row label="Type" value={viewModal.school.type} />
            <Row label="Currency" value={viewModal.school.currency} />
            <Row label="Levels" value={viewModal.school.levels?.join(', ')} />
            <Row label="Admin Email" value={viewModal.school.adminEmail} />
            <Row label="Admin Phone" value={viewModal.school.adminPhone} />
            <Row label="Requested" value={formatDate(viewModal.school.createdAt, 'full')} />
          </div>
        )}
      </Modal>

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
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}