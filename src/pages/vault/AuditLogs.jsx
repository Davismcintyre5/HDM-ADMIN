import { useEffect, useState } from 'react';
import { getAuditLogs, exportAuditLogs } from '../../services/vault/audit';
import Card from '../../components/vault/ui/Card';
import Table from '../../components/vault/ui/Table';
import Button from '../../components/vault/ui/Button';
import Pagination from '../../components/vault/ui/Pagination';
import { formatDate } from '../../utils/vault/formatDate';
import { HiDownload } from 'react-icons/hi';

export default function AuditLogs() {
  const [data, setData] = useState({ logs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs({ page, limit: 20 })
      .then(res => setData({ logs: res.logs || [], total: res.total || 0 }))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const handleExport = async () => {
    try {
      const blob = await exportAuditLogs();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (err) { alert('Export failed'); }
  };

  const columns = [
    { key: 'action', label: 'Action', render: (row) => <span className="font-medium capitalize">{row.action?.replace(/_/g, ' ')}</span> },
    { key: 'adminId', label: 'Admin', render: (row) => row.adminId?.fullName || row.adminId?.email || 'System' },
    { key: 'description', label: 'Description', render: (row) => <span className="text-xs truncate max-w-xs block">{row.description || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Logs</h1>
        <Button variant="secondary" size="sm" onClick={handleExport}><HiDownload className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>
      <Card>
        <Table columns={columns} data={data.logs} loading={loading} emptyMessage="No audit logs." />
        <Pagination page={page} totalPages={Math.ceil(data.total / 20) || 1} onPageChange={setPage} />
      </Card>
    </div>
  );
}