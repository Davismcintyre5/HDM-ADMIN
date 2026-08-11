import { useState } from 'react';
import Card from '../../../components/farmvexa/ui/Card';
import Badge from '../../../components/farmvexa/ui/Badge';
import Button from '../../../components/farmvexa/ui/Button';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Modal from '../../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../../components/farmvexa/ui/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const PLATFORMS = ['android', 'ios', 'web', 'windows', 'all'];

export default function DownloadsSettings({ settings, setSettings, onSave, saving }) {
  const system = settings.system || {};
  const downloads = system.downloads || [];

  const [modal, setModal] = useState({ open: false, mode: 'create', data: null, index: -1 });
  const [form, setForm] = useState({ name: '', version: '1.0.0', link: '', description: '', platform: 'android', enabled: true });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, index: -1, name: '' });

  const openCreate = () => { setForm({ name: '', version: '1.0.0', link: '', description: '', platform: 'android', enabled: true }); setModal({ open: true, mode: 'create', data: null, index: -1 }); };
  const openEdit = (dl, i) => { setForm(dl); setModal({ open: true, mode: 'edit', data: dl, index: i }); };

  const handleSave = () => {
    let updated;
    if (modal.mode === 'create') {
      updated = [...downloads, form];
    } else {
      updated = downloads.map((d, i) => i === modal.index ? form : d);
    }
    setSettings(prev => ({ ...prev, system: { ...prev.system, downloads: updated } }));
    setModal({ open: false, mode: 'create', data: null, index: -1 });
  };

  const handleDelete = () => {
    const updated = downloads.filter((_, i) => i !== confirmDelete.index);
    setSettings(prev => ({ ...prev, system: { ...prev.system, downloads: updated } }));
    setConfirmDelete({ open: false, index: -1, name: '' });
  };

  const handleSaveAll = () => onSave({ system: settings.system });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Downloads</h2>
          <Button size="sm" onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Download</Button>
        </div>
        {downloads.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No downloads added yet.</p>
        ) : (
          <div className="space-y-2">
            {downloads.map((dl, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{dl.name} <span className="text-xs text-[var(--text-muted)]">v{dl.version}</span></p>
                  <p className="text-xs text-[var(--text-muted)]">{dl.platform} · {dl.enabled ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(dl, i)}><HiPencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, index: i, name: dl.name })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} loading={saving} size="lg">Save Downloads</Button>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null, index: -1 })} title={modal.mode === 'create' ? 'Add Download' : 'Edit Download'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <Input label="Link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Toggle label="Enabled" checked={form.enabled} onChange={v => setForm({ ...form, enabled: v })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null, index: -1 })}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, index: -1, name: '' })} onConfirm={handleDelete}
        title="Delete Download" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" />
    </div>
  );
}