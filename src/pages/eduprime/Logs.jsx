import { useState, useEffect } from 'react';
import { getLogs, clearLogs } from '../../services/eduprime/logs';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';

const actionVariant = {
  school_created: 'success', school_updated: 'info', school_deleted: 'danger',
  backup_created: 'info', backup_restored: 'warning', backup_deleted: 'danger',
  settings_updated: 'warning', login: 'info', legal_updated: 'info',
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    getLogs({ page, limit: 20 })
      .then(res => {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const handleClear = async () => {
    if (!window.confirm('Clear all logs? This cannot be undone.')) return;
    setActionLoading(true);
    try { await clearLogs(); fetchLogs(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'action', label: 'Action', render: row => <Badge variant={actionVariant[row.action] || 'default'}>{row.action?.replace(/_/g, ' ')}</Badge> },
    { key: 'adminId', label: 'Performed By', render: row => <span className="text-sm">{row.adminId?.name || '—'}</span> },
    { key: 'details', label: 'Details', render: row => <span className="text-xs text-[var(--text-muted)]">{row.details || '—'}</span> },
    { key: 'ip', label: 'IP', render: row => <span className="text-xs font-mono text-[var(--text-muted)]">{row.ip || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Activity Logs</h1>
        <Button variant="danger" onClick={handleClear} loading={actionLoading}>Clear All Logs</Button>
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No logs found." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}