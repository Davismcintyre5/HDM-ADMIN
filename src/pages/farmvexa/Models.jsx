import { useState, useEffect } from 'react';
import { getModels, createModel, updateModel, deleteModel, trainModel, deployModel } from '../../services/farmvexa/models';
import Card from '../../components/farmvexa/ui/Card';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiPlus, HiPencil, HiTrash, HiLightningBolt, HiCloudUpload } from 'react-icons/hi';

const statusVariant = { active: 'success', training: 'warning', draft: 'default', ready: 'info' };

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ name: '', version: 'v1.0.0', type: 'ml_model', cropType: '', classes: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchModels = () => {
    setLoading(true);
    getModels().then(res => setModels(res?.data?.models || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchModels(); }, []);

  const openCreate = () => { setForm({ name: '', version: 'v1.0.0', type: 'ml_model', cropType: '', classes: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (m) => { setForm({ ...m, classes: m.classes?.join(', ') || '' }); setModal({ open: true, mode: 'edit', data: m }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form, classes: form.classes.split(',').map(s => s.trim()).filter(Boolean) };
      if (modal.mode === 'create') await createModel(data);
      else await updateModel(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null }); fetchModels();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleTrain = async (id) => { setActionLoading(true); try { await trainModel(id); fetchModels(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDeploy = async (id) => { setActionLoading(true); try { await deployModel(id); fetchModels(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDelete = async () => { setActionLoading(true); try { await deleteModel(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchModels(); } catch (err) { alert(err.message); } setActionLoading(false); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Models</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> New Model</Button>
      </div>

      <div className="space-y-4">
        {models.map(model => (
          <Card key={model.id || model._id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{model.name}</h3>
                  <Badge variant="info">{model.version}</Badge>
                  <Badge variant={statusVariant[model.status] || 'default'}>{model.status}</Badge>
                  {model.deployedToPython && <Badge variant="success">Live</Badge>}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Type: {model.type} | Crop: {model.cropType || 'General'}
                  {model.accuracy && ` | Accuracy: ${model.accuracy}%`}
                  {model.lastTrained && ` | Trained: ${formatDate(model.lastTrained)}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(model)}><HiPencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="warning" onClick={() => handleTrain(model.id || model._id)}><HiLightningBolt className="w-3 h-3" /></Button>
                {!model.deployedToPython && <Button size="sm" variant="success" onClick={() => handleDeploy(model.id || model._id)}><HiCloudUpload className="w-3 h-3" /></Button>}
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: model.id || model._id, name: model.name })}><HiTrash className="w-3 h-3" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {models.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No models created yet.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Model' : 'Edit Model'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['ml_model', 'rule_engine'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Input label="Crop Type" value={form.cropType} onChange={e => setForm({ ...form, cropType: e.target.value })} placeholder="tomato" />
          </div>
          <Input label="Classes (comma separated)" value={form.classes} onChange={e => setForm({ ...form, classes: e.target.value })} placeholder="Healthy, Early Blight, Late Blight" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Model" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}