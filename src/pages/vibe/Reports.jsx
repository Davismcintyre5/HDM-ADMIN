import { useEffect, useState } from 'react';
import { getReports, resolveReport, dismissReport } from '../../services/vibe/moderation';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Modal from '../../components/vibe/ui/Modal';
import Input from '../../components/vibe/ui/Input';
import Pagination from '../../components/vibe/ui/Pagination';
import { formatDate } from '../../utils/vibe/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    getReports({ page, limit: 20, status: 'pending' })
      .then(res => {
        setReports(res.data || []);
        setMeta({ total: res.total || 0, page: res.page || 1, pages: res.pages || 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page]);

  const handleResolve = async () => {
    setActionLoading(true);
    try { await resolveReport(resolveModal.id, resolution); setResolveModal({ open: false, id: null }); setResolution(''); fetchReports(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDismiss = async (id) => {
    try { await dismissReport(id); fetchReports(); } catch (err) { alert(err.message); }
  };

  const statusV = { pending: 'warning', resolved: 'success', dismissed: 'default' };

  const columns = [
    { key: 'reporter', label: 'Reporter', render: (row) => row.reporter?.username || row.reporter?.email || 'N/A' },
    { key: 'reason', label: 'Reason', render: (row) => <Badge variant="gradient">{row.reason}</Badge> },
    { key: 'targetType', label: 'Target', render: (row) => <span className="text-xs capitalize">{row.targetType}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      row.status === 'pending' ? (
        <div className="flex gap-1">
          <Button size="sm" variant="success" onClick={() => setResolveModal({ open: true, id: row._id })}><HiCheck className="w-4 h-4" /></Button>
          <Button size="sm" variant="danger" onClick={() => handleDismiss(row._id)}><HiX className="w-4 h-4" /></Button>
        </div>
      ) : null
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reports</h1>
      <Card>
        <Table columns={columns} data={reports} loading={loading} emptyMessage="No reports." />
        <Pagination page={page} totalPages={meta.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal open={resolveModal.open} onClose={() => { setResolveModal({ open: false, id: null }); setResolution(''); }} title="Resolve Report" size="sm">
        <div className="space-y-4">
          <Input label="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Describe resolution" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setResolveModal({ open: false, id: null }); setResolution(''); }}>Cancel</Button>
            <Button variant="success" onClick={handleResolve} loading={actionLoading}>Resolve</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}