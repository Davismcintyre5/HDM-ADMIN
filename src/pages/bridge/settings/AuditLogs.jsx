import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../services/bridge/admins';
import Card from '../../../components/bridge/ui/Card';
import Table from '../../../components/bridge/ui/Table';
import Badge from '../../../components/bridge/ui/Badge';
import Button from '../../../components/bridge/ui/Button';
import Pagination from '../../../components/bridge/ui/Pagination';
import { formatDate } from '../../../utils/bridge/formatDate';
import { HiDownload } from 'react-icons/hi';

export default function AuditLogsSettings() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit: 20 })
      .then(res => {
        setLogs(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const actionVariant = {
    create: 'success',
    update: 'info',
    delete: 'danger',
    login: 'indigo',
    logout: 'default',
  };

  const columns = [
    { key: 'action', label: 'Action', render: (row) => (
      <Badge variant={actionVariant[row.action] || 'indigo'}>{row.action}</Badge>
    )},
    { key: 'adminId', label: 'Admin', render: (row) => (
      <span className="text-sm">
        {row.adminId?.firstName ? `${row.adminId.firstName} ${row.adminId.lastName}` : (row.adminId?.email || 'System')}
      </span>
    )},
    { key: 'resourceType', label: 'Resource', render: (row) => (
      <span className="capitalize text-xs">{row.resourceType}</span>
    )},
    { key: 'details', label: 'Details', render: (row) => (
      <span className="text-xs text-[var(--text-muted)]">
        {row.details?.method} {row.details?.endpoint?.split('/').slice(-2).join('/') || '—'}
      </span>
    )},
    { key: 'details.ip', label: 'IP', render: (row) => (
      <span className="text-xs font-mono text-[var(--text-muted)]">{row.details?.ip || '—'}</span>
    )},
    { key: 'timestamp', label: 'Date', render: (row) => (
      <span className="text-xs whitespace-nowrap">{formatDate(row.timestamp || row.createdAt, 'DD/MM/YYYY HH:mm')}</span>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Audit Logs</h2>
          <p className="text-xs text-[var(--text-muted)]">{pagination.total || logs.length} entries</p>
        </div>
        <Button size="sm" variant="outline">
          <HiDownload className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No audit logs found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>
    </div>
  );
}