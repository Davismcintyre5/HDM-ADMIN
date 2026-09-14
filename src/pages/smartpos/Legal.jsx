import { useState, useEffect } from 'react';
import { getLegals, createLegal, updateLegal, activateLegal, deactivateLegal, deleteLegal, getLegalHistory } from '../../services/smartpos/legal';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Toggle from '../../components/smartpos/ui/Toggle';
import Modal from '../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Spinner from '../../components/smartpos/ui/Spinner';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';

const TYPES = [
  { value: 'terms', label: 'Terms of Service' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'refund', label: 'Refund Policy' },
  { value: 'acceptable_use', label: 'Acceptable Use' },
];

export default function Legal() {
  const [legals, setLegals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ type: 'terms', version: '1.0', title: '', content: '', contentFormat: 'markdown', locale: 'en', active: false, requiresAcceptance: false });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

  const fetchLegals = () => {
    setLoading(true);
    getLegals().then(res => setLegals(res?.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLegals(); }, []);

  const openCreate = () => { setForm({ type: 'terms', version: '1.0', title: '', content: '', contentFormat: 'markdown', locale: 'en', active: false, requiresAcceptance: false }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (l) => { setForm(l); setModal({ open: true, mode: 'edit', data: l }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createLegal(form);
      else await updateLegal(modal.data._id || modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchLegals();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleActivate = async (id) => { setActionLoading(true); try { await activateLegal(id); fetchLegals(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDeactivate = async (id) => { setActionLoading(true); try { await deactivateLegal(id); fetchLegals(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDelete = async () => { setActionLoading(true); try { await deleteLegal(confirmDelete.id); setConfirmDelete({ open: false, id: null, title: '' }); fetchLegals(); } catch (err) { alert(err.message); } setActionLoading(false); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Legal</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> New Document</Button>
      </div>

      <div className="space-y-3">
        {legals.map(l => (
          <Card key={l._id || l.id} className="!p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{l.title}</h3>
                  <Badge variant="info">{l.type}</Badge>
                  <Badge variant="default">v{l.version}</Badge>
                  {l.active && <Badge variant="success">Active</Badge>}
                  {l.requiresAcceptance && <Badge variant="warning">Requires Acceptance</Badge>}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{l.locale} · {formatDate(l.updatedAt || l.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(l)}><HiPencil className="w-3 h-3" /></Button>
                {l.active ? (
                  <Button size="sm" variant="warning" onClick={() => handleDeactivate(l._id || l.id)}><HiX className="w-3 h-3" /></Button>
                ) : (
                  <Button size="sm" variant="success" onClick={() => handleActivate(l._id || l.id)}><HiCheck className="w-3 h-3" /></Button>
                )}
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: l._id || l.id, title: l.title })}><HiTrash className="w-3 h-3" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {legals.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No legal documents.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Legal' : 'Edit Legal'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
          </div>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={12}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm font-mono resize-y" />
          </div>
          <Input label="Locale" value={form.locale} onChange={e => setForm({ ...form, locale: e.target.value })} />
          <Toggle label="Requires Acceptance" checked={form.requiresAcceptance} onChange={v => setForm({ ...form, requiresAcceptance: v })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, title: '' })} onConfirm={handleDelete}
        title="Delete Legal" message={`Delete ${confirmDelete.title}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}