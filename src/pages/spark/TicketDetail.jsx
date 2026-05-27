import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTicket, assignTicket, replyTicket, updateTicketStatus, updateTicketPriority } from '../../services/spark/tickets';
import Card from '../../components/spark/ui/Card';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Spinner from '../../components/spark/ui/Spinner';
import Input from '../../components/spark/ui/Input';
import { formatDate } from '../../utils/spark/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTicket = () => {
    setLoading(true);
    getTicket(id).then(setTicket).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleAssign = async () => { try { await assignTicket(id); fetchTicket(); } catch (err) { alert(err.message); } };
  const handleStatus = async (status) => { try { await updateTicketStatus(id, status); fetchTicket(); } catch (err) { alert(err.message); } };
  const handlePriority = async (priority) => { try { await updateTicketPriority(id, priority); fetchTicket(); } catch (err) { alert(err.message); } };
  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try { await replyTicket(id, { message: reply }); setReply(''); fetchTicket(); } catch (err) { alert(err.message); }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!ticket) return <Card className="text-center text-red-500">Ticket not found</Card>;

  const statusV = { open: 'warning', in_progress: 'info', waiting: 'default', resolved: 'success', closed: 'default' };
  const priorityV = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

  return (
    <div>
      <button onClick={() => navigate('/spark/tickets')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"><HiArrowLeft /> Back to Tickets</button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{ticket.subject || ticket.title}</h1>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={handleAssign}>Assign to Me</Button>
          <select value={ticket.status} onChange={(e) => handleStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            <option value="open">Open</option><option value="in_progress">In Progress</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
          </select>
          <select value={ticket.priority} onChange={(e) => handlePriority(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card><p className="text-[var(--text-primary)]">{ticket.description || ticket.body}</p></Card>
          <Card>
            <h3 className="font-semibold mb-3">Reply</h3>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 resize-y" placeholder="Type reply..." />
            <div className="flex justify-end mt-3"><Button onClick={handleReply} loading={sending}>Send Reply</Button></div>
          </Card>
        </div>
        <Card>
          <h3 className="font-semibold mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusV[ticket.status]}>{ticket.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Priority:</dt><dd><Badge variant={priorityV[ticket.priority]}>{ticket.priority}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Category:</dt><dd><Badge variant="sky">{ticket.category}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Date:</dt><dd className="text-[var(--text-primary)]">{formatDate(ticket.createdAt, 'full')}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  );
}