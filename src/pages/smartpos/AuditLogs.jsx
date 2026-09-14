import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/smartpos/audit';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit: 20 })
      .then(res => { setLogs(res?.data || []); setPagination(res?.meta || { page: 1, pages: 1 }); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'action', label: 'Action', render: row => <Badge variant="info">{row.action || '—'}</Badge> },
    { key: 'admin', label: 'Admin', render: row => <span className="text-sm">{row.admin?.name || row.adminName || '—'}</span> },
    { key: 'target', label: 'Target', render: row => <span className="text-xs text-[var(--text-muted)]">{row.targetType} — {row.targetId?.substring(0, 8)}...</span> },
    { key: 'ip', label: 'IP', render: row => <span className="text-xs font-mono text-[var(--text-muted)]">{row.ip || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Audit Log</h1>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No logs found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}