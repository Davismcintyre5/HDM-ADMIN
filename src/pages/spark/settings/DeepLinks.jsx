import { useEffect, useState } from 'react';
import { getDeepLinks, createDeepLink, updateDeepLink, deleteDeepLink, toggleDeepLink } from '../../../services/spark/deepLinks';
import Card from '../../../components/spark/ui/Card';
import Table from '../../../components/spark/ui/Table';
import Button from '../../../components/spark/ui/Button';
import Modal from '../../../components/spark/ui/Modal';
import Input from '../../../components/spark/ui/Input';
import Toggle from '../../../components/spark/ui/Toggle';
import Badge from '../../../components/spark/ui/Badge';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';

export default function DeepLinksSettings() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, link: null });
  const [form, setForm] = useState({ platform: 'spark', name: '', urlScheme: '', iosScheme: '', androidScheme: '', webFallback: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchLinks = () => { setLoading(true); getDeepLinks().then(setLinks).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchLinks(); }, []);

  const openCreate = () => { setForm({ platform: 'spark', name: '', urlScheme: '', iosScheme: '', androidScheme: '', webFallback: '', isActive: true }); setModal({ open: true, link: null }); };
  const openEdit = (link) => { setForm({ ...link }); setModal({ open: true, link }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.link) await updateDeepLink(modal.link._id, form);
      else await createDeepLink(form);
      setModal({ open: false, link: null }); fetchLinks();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleToggle = async (id, isActive) => { try { await toggleDeepLink(id, isActive); fetchLinks(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { try { await deleteDeepLink(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchLinks(); } catch (err) { alert(err.message); } };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'platform', label: 'Platform', render: (row) => <Badge variant="sky">{row.platform}</Badge> },
    { key: 'isActive', label: 'Active', render: (row) => (
      <button onClick={() => handleToggle(row._id, !row.isActive)}>
        <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'On' : 'Off'}</Badge>
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Deep Links</h2>
        <Button size="sm" onClick={openCreate}>Add Link</Button>
      </div>
      <Card><Table columns={columns} data={links} loading={loading} emptyMessage="No deep links." /></Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, link: null })} title={modal.link ? 'Edit Deep Link' : 'New Deep Link'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select value={form.platform} onChange={(e) => setForm(p => ({ ...p, platform: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="spark">Spark</option><option value="vibe">Vibe</option>
            </select>
          </div>
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="URL Scheme" value={form.urlScheme} onChange={(e) => setForm(p => ({ ...p, urlScheme: e.target.value }))} />
          <Input label="iOS Scheme" value={form.iosScheme} onChange={(e) => setForm(p => ({ ...p, iosScheme: e.target.value }))} />
          <Input label="Android Scheme" value={form.androidScheme} onChange={(e) => setForm(p => ({ ...p, androidScheme: e.target.value }))} />
          <Input label="Web Fallback" value={form.webFallback} onChange={(e) => setForm(p => ({ ...p, webFallback: e.target.value }))} />
          <Toggle label="Active" checked={form.isActive} onChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({ open: false, link: null })}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Deep Link" message="Delete this deep link?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}