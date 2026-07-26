import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, sendAnnouncement } from '../../services/rvnp/announcements';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiPlus, HiPencil, HiTrash, HiPaperAirplane } from 'react-icons/hi';

const priorityVariant = { normal: 'default', important: 'warning', urgent: 'danger' };

const emptyForm = { title: '', body: '', targetAudience: 'all', targetIds: [], channels: ['in-app'], priority: 'normal' };

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchData = () => {
    setLoading(true);
    getAnnouncements().then(res => setAnnouncements(Array.isArray(res.data) ? res.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (a) => { setForm({ title: a.title, body: a.body, targetAudience: a.targetAudience || 'all', targetIds: a.targetIds || [], channels: a.channels || ['in-app'], priority: a.priority || 'normal' }); setModal({ open: true, mode: 'edit', data: a }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createAnnouncement(form);
      else await updateAnnouncement(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteAnnouncement(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleSend = async (id) => {
    setActionLoading(true);
    try { await sendAnnouncement(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Announcements</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Create</Button>
      </div>
      <div className="space-y-3">
        {announcements.map(a => (
          <Card key={a._id} className="!p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{a.title}</h3>
                  <Badge variant={priorityVariant[a.priority] || 'default'}>{a.priority}</Badge>
                  {a.sentAt && <Badge variant="success">Sent</Badge>}
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{a.body}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">Audience: {a.targetAudience} · {formatDate(a.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(a)}><HiPencil className="w-4 h-4" /></Button>
                {!a.sentAt && <Button size="sm" variant="success" onClick={() => handleSend(a._id)}><HiPaperAirplane className="w-4 h-4" /></Button>}
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: a._id })}><HiTrash className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {announcements.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No announcements yet.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Announcement' : 'Edit Announcement'} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Body</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['normal', 'important', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Audience</label>
              <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['all', 'department', 'hostel'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Announcement" message="Delete this announcement?" confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}