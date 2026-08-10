import { useState, useEffect } from 'react';
import { getModels, createModel, deleteModel } from '../../services/hdmai2/models';
import Card from '../../components/hdmai2/ui/Card';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiCube, HiPlus, HiTrash } from 'react-icons/hi';

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', version: 'v1.0.0', base_model: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [pythonDown, setPythonDown] = useState(false);

  const fetchModels = () => {
    setLoading(true);
    getModels()
      .then(res => {
        if (res?.success === false) {
          setPythonDown(true);
          setModels([]);
        } else {
          setPythonDown(false);
          const modelsList = res?.data?.models || res?.data || [];
          setModels(Array.isArray(modelsList) ? modelsList : []);
        }
      })
      .catch(() => setPythonDown(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchModels(); }, []);

  const handleCreate = async () => {
    if (!form.name) return alert('Model name is required');
    setActionLoading(true);
    try { await createModel(form); setCreateModal(false); fetchModels(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteModel(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchModels(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Models</h1>
        <Button onClick={() => { setForm({ name: '', version: 'v1.0.0', base_model: '' }); setCreateModal(true); }} disabled={pythonDown}>
          <HiPlus className="w-4 h-4 mr-1" /> Add Model
        </Button>
      </div>

      {pythonDown && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 p-4 rounded-lg mb-6 text-sm">
          ⚠️ AI service unavailable. Some features are disabled.
        </div>
      )}

      {models.length === 0 && !pythonDown ? (
        <Card>
          <div className="text-center py-12">
            <HiCube className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Models Found</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">Create your first model to get started</p>
            <Button onClick={() => { setForm({ name: '', version: 'v1.0.0', base_model: '' }); setCreateModal(true); }}>
              <HiPlus className="w-4 h-4 mr-1" /> Add Model
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
{models.map(model => (
  <Card key={model._id || model.name}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <HiCube className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{model.name}</h2>
            <Badge variant="info">{model.version}</Badge>
            <Badge variant={model.status === 'active' ? 'success' : model.status === 'training' ? 'warning' : 'default'}>
              {model.status}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Capabilities: {model.capabilities?.length ? model.capabilities.join(', ') : 'None yet'}
            {model.trainedAt && ` · Trained: ${formatDate(model.trainedAt)}`}
            {!model.trainedAt && model.createdAt && ` · Created: ${formatDate(model.createdAt)}`}
          </p>
          <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
            {model.fileSizeFormatted && <span>Size: {model.fileSizeFormatted}</span>}
            {model.storage?.type && <span>Storage: {model.storage.type}</span>}
            {model.totalTrainings > 0 && <span>Trainings: {model.totalTrainings}</span>}
          </div>
          {model.metrics && (model.metrics.totalPredictions > 0 || model.metrics.accuracy > 0) && (
            <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
              {model.metrics.totalPredictions > 0 && <span>Predictions: {model.metrics.totalPredictions}</span>}
              {model.metrics.accuracy > 0 && <span>Accuracy: {(model.metrics.accuracy * 100).toFixed(1)}%</span>}
              {model.metrics.avgResponseTime > 0 && <span>Response: {model.metrics.avgResponseTime}ms</span>}
            </div>
          )}
        </div>
      </div>
      <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: model._id || model.name, name: model.name })}>
        <HiTrash className="w-4 h-4" />
      </Button>
    </div>
  </Card>
))}
        </div>
      )}

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add Model" size="md">
        <div className="space-y-4">
          <Input label="Model Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="hdm-fab-2" required />
          <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="v1.0.0" />
          <Input label="Base Model (optional)" value={form.base_model} onChange={e => setForm({ ...form, base_model: e.target.value })} placeholder="hdm-fab-1" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create Model</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Model" message={`Delete ${confirmDelete.name}? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}