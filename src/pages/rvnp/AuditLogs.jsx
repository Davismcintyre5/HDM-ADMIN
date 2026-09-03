import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/rvnp/auditLogs';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit: 20 })
      .then(res => {
        setLogs(res?.data?.logs || res?.data || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const renderDetails = (row) => {
    const details = row.details || row.description || row.meta;
    if (details === null || details === undefined) return '—';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      // Handle common shapes
      if (details.url) return `${details.method || 'GET'} ${details.url}`;
      if (details.message) return details.message;
      try { return JSON.stringify(details); } catch { return '—'; }
    }
    return String(details);
  };

  const columns = [
    { key: 'action', label: 'Action', render: row => <Badge variant="info">{typeof row.action === 'string' ? row.action.replace(/_/g, ' ') : row.action || '—'}</Badge> },
    { key: 'admin', label: 'Admin', render: row => <span className="text-sm">{row.admin?.fullName || row.admin?.name || row.user?.fullName || row.user?.name || '—'}</span> },
    { key: 'details', label: 'Details', render: row => <span className="text-xs text-[var(--text-muted)]">{renderDetails(row)}</span> },
    { key: 'ip', label: 'IP', render: row => row.ip ? <span className="text-xs font-mono text-[var(--text-muted)]">{row.ip}</span> : '—' },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Audit Logs</h1>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No logs found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}