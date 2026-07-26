import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, respondToTicket, updateTicketStatus, addTicketNote } from '../../services/rvnp/support';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

const statusVariant = { open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default' };

export default function SupportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTicket = () => {
    setLoading(true);
    getTicket(id).then(res => setTicket(res.data || res)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleRespond = async () => {
    if (!message.trim()) return;
    setSending(true);
    try { await respondToTicket(id, { message }); setMessage(''); fetchTicket(); } catch (err) { alert(err.message); }
    setSending(false);
  };

  const handleStatus = async (status, resolution) => {
    setSending(true);
    try { await updateTicketStatus(id, { status, resolution }); fetchTicket(); } catch (err) { alert(err.message); }
    setSending(false);
  };

  const handleNote = async () => {
    if (!note.trim()) return;
    setSending(true);
    try { await addTicketNote(id, { note }); setNote(''); fetchTicket(); } catch (err) { alert(err.message); }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!ticket) return <div className="text-center py-20 text-[var(--text-muted)]">Ticket not found.</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/rvnp/support')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><HiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{ticket.subject || 'No subject'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{ticket.user?.firstName} {ticket.user?.lastName} · {ticket.user?.email}</p>
        </div>
        <Badge variant={statusVariant[ticket.status] || 'default'}>{ticket.status?.replace('_', ' ')}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Conversation</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(ticket.messages || []).map(msg => (
                <div key={msg._id} className={`p-3 rounded-lg ${msg.from === 'admin' ? 'bg-emerald-50 dark:bg-emerald-900/20 ml-6' : 'bg-[var(--bg-secondary)] mr-6'}`}>
                  <p className="text-sm text-[var(--text-primary)]">{msg.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{msg.from === 'admin' ? 'You' : ticket.user?.firstName} · {formatDate(msg.createdAt, 'full')}</p>
                </div>
              ))}
            </div>
            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
              <div className="mt-4 flex gap-2">
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your response..." className="flex-1" />
                <Button onClick={handleRespond} loading={sending}>Send</Button>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Details</h2>
            <div className="space-y-2 text-sm">
              <Row label="Category" value={ticket.category} />
              <Row label="Priority" value={ticket.priority} />
              <Row label="Status" value={ticket.status?.replace('_', ' ')} />
              <Row label="Created" value={formatDate(ticket.createdAt)} />
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Actions</h2>
            <div className="space-y-2">
              {ticket.status === 'open' && <Button size="sm" className="w-full" variant="warning" onClick={() => handleStatus('in_progress')}>Mark In Progress</Button>}
              {(ticket.status === 'open' || ticket.status === 'in_progress') && <Button size="sm" className="w-full" variant="success" onClick={() => handleStatus('resolved', 'Issue resolved')}>Resolve</Button>}
              {ticket.status !== 'closed' && <Button size="sm" className="w-full" variant="secondary" onClick={() => handleStatus('closed', 'Ticket closed')}>Close</Button>}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Internal Note</h2>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Add internal note..." />
            <Button size="sm" className="w-full mt-2" variant="secondary" onClick={handleNote} loading={sending}>Add Note</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className="text-[var(--text-primary)]">{value || '—'}</span></div>;
}