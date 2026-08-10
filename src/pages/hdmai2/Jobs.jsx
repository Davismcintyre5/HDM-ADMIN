import { useState, useEffect } from 'react';
import { getJobs, cancelJob, uploadDataset, startTraining } from '../../services/hdmai2/jobs';
import { getModels } from '../../services/hdmai2/models';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiUpload, HiRefresh, HiPlay } from 'react-icons/hi';

const CAPABILITIES = ['greetings', 'classification', 'summarization', 'generation', 'question-answering', 'sentiment'];

const statusVariant = { done: 'success', completed: 'success', running: 'info', pending: 'warning', queued: 'warning', failed: 'danger', cancelled: 'default' };
const statusIcon = { done: '✅', completed: '✅', running: '🔄', pending: '⏳', queued: '⏳', failed: '❌', cancelled: '⬜' };

export default function Jobs() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('greetings');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [uploadedPath, setUploadedPath] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getModels(), getJobs()])
      .then(([m, j]) => {
        const modelList = m?.data?.models || m?.data || [];
        const modelsArr = Array.isArray(modelList) ? modelList : [];
        setModels(modelsArr);
        if (modelsArr.length > 0 && !selectedModel) {
          setSelectedModel(modelsArr[0].name);
        }
        const jobData = j?.data?.jobs || j?.data || j || [];
        setJobs(Array.isArray(jobData) ? jobData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const runningJobs = jobs.filter(j => j.status === 'running' || j.status === 'pending' || j.status === 'queued');
    if (runningJobs.length === 0) return;
    const interval = setInterval(() => fetchData(), 3000);
    return () => clearInterval(interval);
  }, [jobs]);

  const currentModel = models.find(m => m.name === selectedModel);
  const trainedCapabilities = currentModel?.capabilities || [];
  const token = localStorage.getItem('hdmai2_token');

  const handleUpload = async () => {
    if (!uploadFile) return alert('Please select a file');
    const maxSize = 500 * 1024 * 1024;
    if (uploadFile.size > maxSize) return alert('File too large. Maximum size is 500MB.');
    const validExts = ['.json', '.csv', '.zip', '.hdm'];
    const ext = '.' + uploadFile.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) return alert(`Invalid file type. Allowed: ${validExts.join(', ')}`);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('capability', selectedCapability);
      const data = await uploadDataset(formData, token);
      if (data.success) {
        setUploadedPath(data.data?.path || '');
        setUploadFile(null);
      } else {
        alert(data.message);
      }
    } catch (err) { alert(err.message); }
    setUploading(false);
  };

  const handleTrain = async () => {
    if (!uploadedPath) return alert('Upload a dataset first');
    if (!selectedModel) return alert('Select a model');
    setTraining(true);
    try {
      const data = await startTraining({
        model_name: selectedModel,
        dataset_url: uploadedPath,
        hyperparameters: { capability: selectedCapability, epochs: 5 },
      }, token);
      if (data.success) {
        setUploadedPath('');
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) { alert(err.message); }
    setTraining(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this training job?')) return;
    try { await cancelJob(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    pending: jobs.filter(j => j.status === 'pending' || j.status === 'queued').length,
    done: jobs.filter(j => j.status === 'done' || j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const columns = [
    { key: '_id', label: 'ID', render: row => <span className="text-xs font-mono text-[var(--text-muted)]">{(row._id || row.job_id || '').substring(0, 8)}...</span> },
    { key: 'modelName', label: 'Model', render: row => <span className="text-sm">{row.modelName || '—'}</span> },
    { key: 'capability', label: 'Capability', render: row => <Badge variant="info">{row.capability || row.type || 'training'}</Badge> },
    { key: 'status', label: 'Status', render: row => (
      <div className="flex items-center gap-1">
        <span>{statusIcon[row.status] || '⬜'}</span>
        <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
        {row.status === 'running' && row.progress != null && (
          <span className="text-xs text-[var(--text-muted)] ml-1">{row.progress}%</span>
        )}
      </div>
    )},
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        {(row.status === 'running' || row.status === 'pending' || row.status === 'queued') && (
          <Button size="sm" variant="warning" onClick={() => handleCancel(row._id || row.job_id)}>Cancel</Button>
        )}
        {row.status === 'failed' && (
          <Button size="sm" variant="secondary">Retry</Button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Training</h1>

      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Train Model</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Model</label>
            <select value={selectedModel} onChange={e => { setSelectedModel(e.target.value); setUploadedPath(''); }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {models.length === 0 && <option value="">No models available</option>}
              {models.map(m => (
                <option key={m._id || m.name} value={m.name}>
                  {m.name} ({m.capabilities?.length ? m.capabilities.join(', ') : 'empty'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Capability</label>
            <select value={selectedCapability} onChange={e => { setSelectedCapability(e.target.value); setUploadedPath(''); }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm capitalize">
              {CAPABILITIES.map(cap => {
                const trained = trainedCapabilities.includes(cap);
                return <option key={cap} value={cap}>{trained ? '✅' : '⬜'} {cap}{trained ? ' (trained)' : ''}</option>;
              })}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Upload Dataset</label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-muted)] truncate">
                  {uploadFile ? `${uploadFile.name} (${(uploadFile.size / 1024).toFixed(1)} KB)` : uploadedPath ? 'Dataset uploaded ✅' : 'Choose file (.json, .csv, .zip, .hdm)'}
                </div>
                <input type="file" accept=".json,.csv,.zip,.hdm" onChange={e => { setUploadFile(e.target.files[0]); setUploadedPath(''); }} className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} loading={uploading} disabled={!uploadFile}>
              <HiUpload className="w-4 h-4 mr-1" /> Upload
            </Button>
            {uploadedPath && (
              <Button variant="success" onClick={handleTrain} loading={training}>
                <HiPlay className="w-4 h-4 mr-1" /> Train Model
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Training Jobs</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-xs text-[var(--text-muted)]">
              <span>📊 {stats.total} total</span>
              {stats.running > 0 && <span>🔄 {stats.running} running</span>}
              {stats.pending > 0 && <span>⏳ {stats.pending} pending</span>}
              <span>✅ {stats.done} done</span>
              {stats.failed > 0 && <span>❌ {stats.failed} failed</span>}
            </div>
            <Button size="sm" variant="secondary" onClick={fetchData}><HiRefresh className="w-4 h-4" /></Button>
          </div>
        </div>
        <Table columns={columns} data={jobs} loading={loading} emptyMessage="No training jobs yet. Upload a dataset and train a model." />
      </Card>
    </div>
  );
}