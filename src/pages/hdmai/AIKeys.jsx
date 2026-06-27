import { useState, useEffect } from 'react';
import { getAIKeys, saveAIKey, deleteAIKey } from '../../services/hdmai/keys';
import Card from '../../components/hdmai/ui/Card';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Input from '../../components/hdmai/ui/Input';
import Toggle from '../../components/hdmai/ui/Toggle';
import Modal from '../../components/hdmai/ui/Modal';
import ConfirmDialog from '../../components/hdmai/ui/ConfirmDialog';
import Spinner from '../../components/hdmai/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const MODULES = ['general', 'smartpos', 'spark', 'vibe', 'vault', 'erp', 'widget'];
const PROVIDERS = ['groq', 'gemini'];

export default function AIKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ module: 'general', provider: 'groq', apiKey: '', model: '', isActive: true });

const fetchKeys = () => {
  setLoading(true);
  getAIKeys()
    .then(res => {
      const d = res?.data || res;
      // API returns array directly, or { keys: [] }
      setKeys(Array.isArray(d) ? d : d.keys || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
};

  useEffect(() => { fetchKeys(); }, []);

  const openCreate = () => { setForm({ module: 'general', provider: 'groq', apiKey: '', model: '', isActive: true }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (key) => { setForm({ module: key.module, provider: key.provider, apiKey: '', model: key.model || '', isActive: key.isActive }); setModal({ open: true, mode: 'edit', data: key }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      await saveAIKey(form);
      setModal({ open: false, mode: 'create', data: null });
      fetchKeys();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteAIKey(confirm.id); fetchKeys(); } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Provider Keys</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Key</Button>
      </div>
      <Card>
        {keys.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No AI keys configured. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr><th className="px-3 py-2 text-left">Module</th><th className="px-3 py-2 text-left">Provider</th><th className="px-3 py-2 text-left">Model</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {keys.map(k => (
                  <tr key={k._id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2"><Badge variant="fuchsia">{k.module}</Badge></td>
                    <td className="px-3 py-2 text-[var(--text-primary)] capitalize">{k.provider}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{k.model || '—'}</td>
                    <td className="px-3 py-2"><Badge variant={k.isActive ? 'success' : 'default'}>{k.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(k)}><HiPencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirm({ open: true, id: k._id })}><HiTrash className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add AI Key' : 'Edit AI Key'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Module</label>
            <select value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <select value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Input label="API Key" type="password" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} placeholder={modal.mode === 'edit' ? 'Leave empty to keep current' : 'Enter API key'} required={modal.mode === 'create'} />
          <Input label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. gemini-2.0-flash" />
          <Toggle label="Active" checked={form.isActive} onChange={v => setForm({ ...form, isActive: v })} />
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete AI Key" message="Are you sure you want to delete this AI key?" confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}