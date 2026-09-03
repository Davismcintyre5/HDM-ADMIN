import { useState, useEffect } from 'react';
import { getReports, updateReportStatus, deleteReport } from '../../services/rvnp/reports';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiEye, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'REVIEWED', label: 'Reviewed' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'DISMISSED', label: 'Dismissed' },
];

const statusVariant = { PENDING: 'warning', REVIEWED: 'info', RESOLVED: 'success', DISMISSED: 'default' };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, report: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchReports = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    getReports(params)
      .then(res => {
        setReports(res?.data?.reports || res?.data || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page, filter]);

  const handleStatus = async (id, status) => {
    setActionLoading(true);
    try { await updateReportStatus(id, { status }); setViewModal({ open: false, report: null }); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteReport(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'reason', label: 'Reason', render: row => <span className="text-sm">{row.reason || row.type || '—'}</span> },
    { key: 'reporter', label: 'Reporter', render: row => <span className="text-sm">{row.reporter?.fullName || row.reporter?.name || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, report: row })}><HiEye className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id || row._id, name: row.reason || row.type })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reports</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={reports} loading={loading} emptyMessage="No reports found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, report: null })} title="Report Details" size="md">
        {viewModal.report && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Reason" value={viewModal.report.reason || viewModal.report.type} />
              <Row label="Reporter" value={viewModal.report.reporter?.fullName || viewModal.report.reporter?.name} />
              <Row label="Status">
                <Badge variant={statusVariant[viewModal.report.status] || 'default'}>{viewModal.report.status}</Badge>
              </Row>
              <Row label="Date" value={formatDate(viewModal.report.createdAt, 'full')} />
            </div>
            {viewModal.report.status === 'PENDING' && (
              <div className="flex justify-end gap-2">
                <Button variant="danger" onClick={() => handleStatus(viewModal.report.id || viewModal.report._id, 'DISMISSED')} loading={actionLoading}>Dismiss</Button>
                <Button variant="success" onClick={() => handleStatus(viewModal.report.id || viewModal.report._id, 'RESOLVED')} loading={actionLoading}>Resolve</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Report" message={`Delete report "${confirmDelete.name}"?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold, children }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span>{children || <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span>}</div>;
}