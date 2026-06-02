import { useEffect, useState } from 'react';
import { getBroadcasts, createBroadcast } from '../../services/vibe/broadcast';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Modal from '../../components/vibe/ui/Modal';
import Input from '../../components/vibe/ui/Input';
import Toggle from '../../components/vibe/ui/Toggle';
import Pagination from '../../components/vibe/ui/Pagination';
import { formatDate } from '../../utils/vibe/formatDate';
import { HiPlus } from 'react-icons/hi';

export default function Broadcast() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', targetAudience: 'all', sendPush: true, sendEmail: false });
  const [sending, setSending] = useState(false);

  const fetchBroadcasts = () => {
    setLoading(true);
    getBroadcasts({ page, limit: 20 })
      .then(res => {
        setBroadcasts(res.data || []);
        setMeta({ total: res.total || 0, page: res.page || 1, pages: res.pages || 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBroadcasts(); }, [page]);

  const handleSend = async () => {
    setSending(true);
    try { await createBroadcast(form); setModal(false); setForm({ title: '', body: '', targetAudience: 'all', sendPush: true, sendEmail: false }); fetchBroadcasts(); }
    catch (err) { alert(err.message); }
    setSending(false);
  };

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'targetAudience', label: 'Audience', render: (row) => <Badge variant="gradient">{row.targetAudience}</Badge> },
    { key: 'recipientCount', label: 'Recipients', render: (row) => row.recipientCount || 0 },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'sent' ? 'success' : 'warning'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Broadcast</h1>
        <Button onClick={() => setModal(true)}><HiPlus className="w-4 h-4 mr-1" /> New Broadcast</Button>
      </div>
      <Card>
        <Table columns={columns} data={broadcasts} loading={loading} emptyMessage="No broadcasts." />
        <Pagination page={page} totalPages={meta.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New Broadcast" size="md">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message</label>
            <textarea value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Audience</label>
            <select value={form.targetAudience} onChange={(e) => setForm(p => ({ ...p, targetAudience: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="all">All Users</option>
              <option value="verified">Verified Only</option>
              <option value="subscribers">Subscribers Only</option>
            </select>
          </div>
          <Toggle label="Send Push Notification" checked={form.sendPush} onChange={(v) => setForm(p => ({ ...p, sendPush: v }))} />
          <Toggle label="Send Email" checked={form.sendEmail} onChange={(v) => setForm(p => ({ ...p, sendEmail: v }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSend} loading={sending}>Send Broadcast</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}