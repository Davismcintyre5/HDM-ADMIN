import { useState, useEffect } from 'react';
import { getReports, resolveReport, dismissReport } from '../../services/rvnp/reports';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];
const typeVariant = { harassment: 'danger', spam: 'warning', inappropriate: 'danger', other: 'default' };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [dismissModal, setDismissModal] = useState({ open: false, id: null });
  const [resolution, setResolution] = useState('');

  const fetchReports = () => {
    setLoading(true);
    getReports({ page, limit: 20, status: filter })
      .then(res => {
        setReports(Array.isArray(res.data) ? res.data : res.reports || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page, filter]);

  const handleResolve = async () => {
    setActionLoading(true);
    try { await resolveReport(resolveModal.id, { resolution, actionTaken: 'content_removed' }); setResolveModal({ open: false, id: null }); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDismiss = async () => {
    setActionLoading(true);
    try { await dismissReport(dismissModal.id, { resolution }); setDismissModal({ open: false, id: null }); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'reporter', label: 'Reporter', render: row => row.reporter?.firstName ? `${row.reporter.firstName} ${row.reporter.lastName}` : '—' },
    { key: 'type', label: 'Type', render: row => <Badge variant={typeVariant[row.type] || 'default'}>{row.type}</Badge> },
    { key: 'reason', label: 'Reason', render: row => <span className="text-sm">{row.reason || row.description || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => row.status === 'pending' ? (
      <div className="flex gap-1">
        <Button size="sm" variant="success" onClick={() => setResolveModal({ open: true, id: row._id })}><HiCheck className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setDismissModal({ open: true, id: row._id })}><HiX className="w-4 h-4" /></Button>
      </div>
    ) : <Badge variant={row.status === 'resolved' ? 'success' : 'default'}>{row.status}</Badge> },
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

      <Modal open={resolveModal.open} onClose={() => setResolveModal({ open: false, id: null })} title="Resolve Report">
        <Input label="Resolution" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe action taken" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setResolveModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="success" onClick={handleResolve} loading={actionLoading}>Resolve</Button>
        </div>
      </Modal>

      <Modal open={dismissModal.open} onClose={() => setDismissModal({ open: false, id: null })} title="Dismiss Report">
        <Input label="Reason" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Reason for dismissal" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setDismissModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDismiss} loading={actionLoading}>Dismiss</Button>
        </div>
      </Modal>
    </div>
  );
}