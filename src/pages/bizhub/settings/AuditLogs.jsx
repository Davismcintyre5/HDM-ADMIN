import { useEffect, useState } from 'react';
import { getAuditLogs, exportAuditLogs } from '../../../services/bizhub/audit';
import Card from '../../../components/bizhub/ui/Card';
import Table from '../../../components/bizhub/ui/Table';
import Button from '../../../components/bizhub/ui/Button';
import Badge from '../../../components/bizhub/ui/Badge';
import Pagination from '../../../components/bizhub/ui/Pagination';
import { formatDate } from '../../../utils/bizhub/formatDate';
import { HiDownload } from 'react-icons/hi';

export default function AuditLogsSettings() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit: 20 })
      .then(res => setLogs(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const handleExport = async () => {
    try {
      const blob = await exportAuditLogs();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (err) { alert('Export failed'); }
  };

  const columns = [
    { key: 'action', label: 'Action', render: (row) => <Badge variant="teal">{row.action}</Badge> },
    { key: 'admin', label: 'Admin', render: (row) => row.admin?.name || row.admin?.email || 'System' },
    { key: 'module', label: 'Module', render: (row) => <span className="text-xs capitalize">{row.module || '—'}</span> },
    { key: 'description', label: 'Description', render: (row) => <span className="text-xs truncate max-w-xs block">{row.description || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <Button size="sm" variant="outline" onClick={handleExport}><HiDownload className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No audit logs." />
        <Pagination page={page} totalPages={Math.ceil(logs.length / 20) || 1} onPageChange={setPage} />
      </Card>
    </div>
  );
}