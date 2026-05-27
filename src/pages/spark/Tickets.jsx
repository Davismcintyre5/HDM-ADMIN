import { useState, useEffect } from 'react';
import { getTickets, assignTicket, updateTicketStatus, updateTicketPriority } from '../../services/spark/tickets';
import Card from '../../components/spark/ui/Card';
import Table from '../../components/spark/ui/Table';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Pagination from '../../components/spark/ui/Pagination';
import { formatDate } from '../../utils/spark/formatDate';
import { useNavigate } from 'react-router-dom';
import { HiEye } from 'react-icons/hi';

export default function Tickets() {
  const navigate = useNavigate();
  const [data, setData] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTickets = () => {
    setLoading(true);
    getTickets({ page, limit: 20 })
      .then(res => setData({ data: res.data || [], meta: res.meta || {} }))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [page]);

  const statusV = { open: 'warning', in_progress: 'info', waiting: 'default', resolved: 'success', closed: 'default' };
  const priorityV = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

  const columns = [
    { key: 'subject', label: 'Subject', render: (row) => (
      <button onClick={() => navigate(`/spark/tickets/${row._id || row.id}`)} className="text-sky-600 hover:underline font-medium">{row.subject || row.title || 'N/A'}</button>
    )},
    { key: 'category', label: 'Category', render: (row) => <Badge variant="sky">{row.category}</Badge> },
    { key: 'priority', label: 'Priority', render: (row) => <Badge variant={priorityV[row.priority] || 'default'}>{row.priority}</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status?.replace(/_/g, ' ')}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/spark/tickets/${row._id || row.id}`)}><HiEye className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Tickets</h1>
      <Card>
        <Table columns={columns} data={data.data} loading={loading} emptyMessage="No tickets." />
        <Pagination page={page} totalPages={data.meta?.totalPages || 1} onPageChange={setPage} />
      </Card>
    </div>
  );
}