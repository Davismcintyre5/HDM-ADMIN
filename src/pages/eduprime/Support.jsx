import { useState, useEffect } from 'react';
import { getTickets, updateTicket, getContacts, markContactRead } from '../../services/eduprime/support';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Modal from '../../components/eduprime/ui/Modal';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiEye, HiMail } from 'react-icons/hi';

const TABS = [
  { key: 'tickets', label: 'Tickets' },
  { key: 'contacts', label: 'Contact Messages' },
];

const TICKET_FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];
const statusVariant = { open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default' };
const priorityVariant = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

export default function Support() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('open');
  const [msgFilter, setMsgFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, ticket: null });
  const [msgModal, setMsgModal] = useState({ open: false, message: null });
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

  const fetchMessages = () => {
    setLoading(true);
    const params = {};
    if (msgFilter === 'unread') params.read = false;
    if (msgFilter === 'read') params.read = true;
    getContacts(params)
      .then(res => setMessages(res.data || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    activeTab === 'tickets' ? fetchTickets() : fetchMessages();
  }, [page, filter, msgFilter, activeTab]);

  const handleUpdate = async (id, status) => {
    setActionLoading(true);
    try { await updateTicket(id, { status, response }); setViewModal({ open: false, ticket: null }); setResponse(''); fetchTickets(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRead = async (id) => {
    await markContactRead(id);
    fetchMessages();
  };

  const openMessage = (msg) => {
    setMsgModal({ open: true, message: msg });
    if (!msg.isRead) handleRead(msg._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  const ticketColumns = [
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
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Support</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-amber-600 text-amber-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.key === 'contacts' && unreadCount > 0 ? `${t.label} (${unreadCount})` : t.label}
          </button>
        ))}
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {TICKET_FILTERS.map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-amber-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <Card>
            <Table columns={ticketColumns} data={tickets} loading={loading} emptyMessage="No tickets found." />
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </Card>
        </>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Contact Messages</h2>
            <div className="flex gap-2">
              {['all', 'unread', 'read'].map(f => (
                <button key={f} onClick={() => setMsgFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                    msgFilter === f ? 'bg-amber-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-[var(--text-muted)] text-center py-8">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No messages</p>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    msg.isRead ? 'bg-[var(--card-bg)] border-[var(--border-color)]' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && <span className="w-2 h-2 bg-amber-600 rounded-full" />}
                      <span className="font-medium text-sm text-[var(--text-primary)]">{msg.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{msg.email}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mt-1 font-medium">{msg.subject}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Ticket Detail Modal */}
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

      {/* Message Detail Modal */}
      <Modal open={msgModal.open} onClose={() => setMsgModal({ open: false, message: null })} title="Message Detail" size="md">
        {msgModal.message && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[var(--text-muted)]">Name:</span> <span className="font-medium text-[var(--text-primary)]">{msgModal.message.name}</span></div>
              <div><span className="text-[var(--text-muted)]">Email:</span> <span className="font-medium text-[var(--text-primary)]">{msgModal.message.email}</span></div>
              <div><span className="text-[var(--text-muted)]">Date:</span> <span className="font-medium text-[var(--text-primary)]">{formatDate(msgModal.message.createdAt, 'full')}</span></div>
              <div><span className="text-[var(--text-muted)]">Status:</span> <Badge variant={msgModal.message.isRead ? 'success' : 'warning'}>{msgModal.message.isRead ? 'Read' : 'Unread'}</Badge></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Subject</p>
              <p className="font-medium text-[var(--text-primary)]">{msgModal.message.subject}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Message</p>
              <p className="text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 rounded-lg whitespace-pre-wrap">{msgModal.message.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}