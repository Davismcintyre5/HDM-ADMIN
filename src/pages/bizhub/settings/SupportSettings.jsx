import { useState, useEffect } from 'react';
import { getTickets, assignTicket, resolveTicket } from '../../../services/bizhub/support';
import Card from '../../../components/bizhub/ui/Card';
import Table from '../../../components/bizhub/ui/Table';
import Badge from '../../../components/bizhub/ui/Badge';
import Button from '../../../components/bizhub/ui/Button';
import Pagination from '../../../components/bizhub/ui/Pagination';
import { formatDate } from '../../../utils/bizhub/formatDate';

const priorityVariant = { high: 'danger', medium: 'warning', low: 'info', urgent: 'danger' };
const statusVariant = { open: 'warning', in_progress: 'info', resolved: 'success' };

export default function SupportSettings() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    getTickets({ page, limit: 20 })
      .then(res => {
        const d = res?.data || res;
        setTickets(Array.isArray(d) ? d : d.tickets || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [page]);

  const handleAssign = async (id) => {
    setActionLoading(true);
    try { await assignTicket(id); fetchTickets(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleResolve = async (id) => {
    setActionLoading(true);
    try { await resolveTicket(id); fetchTickets(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'title', label: 'Subject', render: row => <span className="font-medium text-[var(--text-primary)]">{row.title || 'N/A'}</span> },
    { key: 'priority', label: 'Priority', render: row => <Badge variant={priorityVariant[row.priority] || 'default'}>{row.priority}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status?.replace('_', ' ')}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        {row.status === 'open' && <Button size="sm" variant="info" onClick={() => handleAssign(row._id)} loading={actionLoading}>Assign</Button>}
        {row.status === 'in_progress' && <Button size="sm" variant="success" onClick={() => handleResolve(row._id)} loading={actionLoading}>Resolve</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">Support Tickets</h2>
      <Card>
        <Table columns={columns} data={tickets} loading={loading} emptyMessage="No tickets found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}