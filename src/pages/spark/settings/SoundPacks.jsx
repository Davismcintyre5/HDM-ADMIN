import { useEffect, useState } from 'react';
import { getSoundPacks, createSoundPack, updateSoundPack, deleteSoundPack } from '../../../services/spark/settings';
import Card from '../../../components/spark/ui/Card';
import Table from '../../../components/spark/ui/Table';
import Button from '../../../components/spark/ui/Button';
import Modal from '../../../components/spark/ui/Modal';
import Input from '../../../components/spark/ui/Input';
import Badge from '../../../components/spark/ui/Badge';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';

export default function SoundPacksSettings() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, pack: null });
  const [form, setForm] = useState({ name: '', description: '', author: '', sounds: [] });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchPacks = () => { setLoading(true); getSoundPacks().then(setPacks).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchPacks(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', author: '', sounds: [] }); setModal({ open: true, pack: null }); };
  const openEdit = (pack) => { setForm({ ...pack }); setModal({ open: true, pack }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.pack) await updateSoundPack(modal.pack._id, form);
      else await createSoundPack(form);
      setModal({ open: false, pack: null }); fetchPacks();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async () => { try { await deleteSoundPack(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchPacks(); } catch (err) { alert(err.message); } };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', label: 'Description', render: (row) => <span className="text-xs truncate max-w-xs block">{row.description}</span> },
    { key: 'author', label: 'Author' },
    { key: 'sounds', label: 'Sounds', render: (row) => <Badge variant="sky">{row.sounds?.length || 0}</Badge> },
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
        <h2 className="text-lg font-semibold">Sound Packs</h2>
        <Button size="sm" onClick={openCreate}>Add Pack</Button>
      </div>
      <Card><Table columns={columns} data={packs} loading={loading} emptyMessage="No sound packs." /></Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, pack: null })} title={modal.pack ? 'Edit Sound Pack' : 'New Sound Pack'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          <Input label="Author" value={form.author} onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))} />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({ open: false, pack: null })}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Sound Pack" message="Delete this sound pack?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}