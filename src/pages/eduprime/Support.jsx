import { useState, useEffect } from 'react';
import { getTickets, updateTicket } from '../../services/eduprime/support';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Modal from '../../components/eduprime/ui/Modal';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];
const statusVariant = { open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default' };
const priorityVariant = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('open');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, ticket: null });
  const [response, setResponse] = useState('');

  const fetchTickets = () => {
    setLoading(true);
    getTickets({ page, limit: 20, status: filter })
      .then(res => {
        setTickets(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [page, filter]);

  const handleUpdate = async (id, status) => {
    setActionLoading(true);
    try { await updateTicket(id, { status, response }); setViewModal({ open: false, ticket: null }); setResponse(''); fetchTickets(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'subject', label: 'Subject', render: row => (
      <button onClick={() => { setViewModal({ open: true, ticket: row }); setResponse(''); }} className="text-amber-600 hover:underline font-medium text-sm">{row.subject || 'No subject'}</button>
    )},
    { key: 'school', label: 'School', render: row => row.school?.name || '—' },
    { key: 'priority', label: 'Priority', render: row => <Badge variant={priorityVariant[row.priority] || 'default'}>{row.priority}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status?.replace('_', ' ')}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <Button size="sm" variant="secondary" onClick={() => { setViewModal({ open: true, ticket: row }); setResponse(''); }}><HiEye className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Support Tickets</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-amber-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        <Table columns={columns} data={tickets} loading={loading} emptyMessage="No tickets found." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, ticket: null })} title="Ticket Details" size="lg">
        {viewModal.ticket && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Subject" value={viewModal.ticket.subject} bold />
              <Row label="School" value={viewModal.ticket.school?.name} />
              <Row label="Priority" value={viewModal.ticket.priority} />
              <Row label="Status" value={viewModal.ticket.status?.replace('_', ' ')} />
              <Row label="Description" value={viewModal.ticket.description || viewModal.ticket.message} />
              <Row label="Date" value={formatDate(viewModal.ticket.createdAt, 'full')} />
            </div>
            {(viewModal.ticket.status === 'open' || viewModal.ticket.status === 'in_progress') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Response</label>
                  <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="warning" onClick={() => handleUpdate(viewModal.ticket._id, 'in_progress')} loading={actionLoading}>In Progress</Button>
                  <Button variant="success" onClick={() => handleUpdate(viewModal.ticket._id, 'resolved')} loading={actionLoading}>Resolve</Button>
                  <Button variant="secondary" onClick={() => handleUpdate(viewModal.ticket._id, 'closed')} loading={actionLoading}>Close</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}