import { useState, useEffect } from 'react';
import { getReports, assignReport, resolveReport, dismissReport } from '../../services/spark/reports';
import Card from '../../components/spark/ui/Card';
import Table from '../../components/spark/ui/Table';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Modal from '../../components/spark/ui/Modal';
import Input from '../../components/spark/ui/Input';
import Pagination from '../../components/spark/ui/Pagination';
import { formatDate } from '../../utils/spark/formatDate';
import { HiEye, HiCheck, HiX } from 'react-icons/hi';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, report: null });
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [resolveForm, setResolveForm] = useState({ resolution: '', actionTaken: 'warning' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    getReports({ page, limit: 20 })
      .then(res => {
        setReports(res.reports || []);
        setMeta({ total: res.total || 0, page: res.page || 1, totalPages: res.totalPages || 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page]);

  const handleAssign = async (id) => {
    try { await assignReport(id); fetchReports(); } catch (err) { alert(err.message); }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try { await resolveReport(resolveModal.id, resolveForm); setResolveModal({ open: false, id: null }); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDismiss = async (id) => {
    try { await dismissReport(id, { reason: 'No violation found' }); fetchReports(); } catch (err) { alert(err.message); }
  };

  const statusV = { submitted: 'warning', under_review: 'info', resolved: 'success', dismissed: 'default' };

  const columns = [
    { key: 'reporterId', label: 'Reporter', render: (row) => (
      <span className="text-[var(--text-primary)]">{row.reporterId?.displayName || row.reporterId?.phone || 'Anonymous'}</span>
    )},
    { key: 'reason', label: 'Reason', render: (row) => <Badge variant="sky">{row.reason}</Badge> },
    { key: 'targetType', label: 'Target', render: (row) => <span className="text-xs capitalize">{row.targetType}</span> },
    { key: 'description', label: 'Description', render: (row) => (
      <span className="truncate max-w-[150px] block text-xs">{row.description || '—'}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={statusV[row.status] || 'default'}>{row.status?.replace(/_/g, ' ')}</Badge>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, report: row })}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'submitted' && <Button size="sm" variant="info" onClick={() => handleAssign(row._id)}>Assign</Button>}
        {row.status === 'under_review' && <Button size="sm" variant="success" onClick={() => setResolveModal({ open: true, id: row._id })}><HiCheck className="w-4 h-4" /></Button>}
        {(row.status === 'submitted' || row.status === 'under_review') && <Button size="sm" variant="danger" onClick={() => handleDismiss(row._id)}><HiX className="w-4 h-4" /></Button>}
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
          <p className="text-xs text-[var(--text-muted)]">{meta.total} report{meta.total !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={reports} loading={loading} emptyMessage="No reports found." />
        <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, report: null })} title="Report Details" size="md">
        {viewModal.report && (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Reporter:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {viewModal.report.reporterId?.displayName || viewModal.report.reporterId?.phone || 'Anonymous'}
                  {viewModal.report.isAnonymous && <Badge className="ml-2">Anonymous</Badge>}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reason:</span><Badge variant="sky">{viewModal.report.reason}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Target Type:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.report.targetType}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Target ID:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.report.targetId}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusV[viewModal.report.status]}>{viewModal.report.status?.replace(/_/g, ' ')}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Date:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.report.createdAt, 'full')}</span></div>
            </div>
            {viewModal.report.description && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Description:</p>
                <p className="text-[var(--text-primary)]">{viewModal.report.description}</p>
              </div>
            )}
            {viewModal.report.resolution && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Resolution:</p>
                <p className="text-[var(--text-primary)]">{viewModal.report.resolution}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal open={resolveModal.open} onClose={() => setResolveModal({ open: false, id: null })} title="Resolve Report" size="md">
        <div className="space-y-4">
          <Input label="Resolution" value={resolveForm.resolution} onChange={(e) => setResolveForm(p => ({ ...p, resolution: e.target.value }))} placeholder="Describe resolution" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Action Taken</label>
            <select value={resolveForm.actionTaken} onChange={(e) => setResolveForm(p => ({ ...p, actionTaken: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="warning">Warning</option>
              <option value="content_removed">Content Removed</option>
              <option value="user_banned">User Banned</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResolveModal({ open: false, id: null })}>Cancel</Button>
            <Button variant="success" onClick={handleResolve} loading={actionLoading}>Resolve</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}