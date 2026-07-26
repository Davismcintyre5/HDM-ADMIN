import { useState, useEffect } from 'react';
import { getBackups, createBackup, deleteBackup, sendBackupEmail, getAutoBackupSettings, updateAutoBackupSettings } from '../../services/rvnp/backups';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Toggle from '../../components/rvnp/ui/Toggle';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiCog } from 'react-icons/hi';

const BASE_URL = import.meta.env.VITE_RVNP_API || 'http://localhost:5000/api/admin';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [autoSettings, setAutoSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const [settingsModal, setSettingsModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getBackups(), getAutoBackupSettings()])
      .then(([b, s]) => {
        setBackups(Array.isArray(b.data) ? b.data : b.backups || []);
        setAutoSettings(s.data || s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try { await createBackup(); fetchData(); } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDownload = (id, filename) => {
    const token = localStorage.getItem('rvnp_token');
    const url = `${BASE_URL}/backups/${id}/download`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(err => alert(err.message));
  };

  const handleSendEmail = async () => {
    setActionLoading(true);
    try {
      await sendBackupEmail(emailModal.id, { email });
      setEmailModal({ open: false, id: null });
      setEmail('');
      alert('Backup sent to email!');
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleAutoSave = async () => {
    setActionLoading(true);
    try { await updateAutoBackupSettings(autoSettings); setSettingsModal(false); fetchData(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (bytes === null || bytes === undefined) return '—';
    if (bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'filename', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.filename || 'backup.json'}</span> },
    { key: 'size', label: 'Size', render: row => <span className="text-sm">{formatSize(row.size)}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant={row.type === 'auto' ? 'info' : 'default'}>{row.type || 'manual'}</Badge> },
    { key: 'contents', label: 'Contents', render: row => (
      <div className="flex gap-1 text-xs">
        {row.contents?.database && <Badge variant="success">DB</Badge>}
        {row.contents?.files && <Badge variant="info">Files</Badge>}
        {row.contents?.config && <Badge variant="warning">Config</Badge>}
      </div>
    )},
    { key: 'createdBy', label: 'Created By', render: row => <span className="text-sm">{row.createdBy?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id, row.filename)} title="Download"><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id }); }} title="Send to email"><HiMail className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.filename })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSettingsModal(true)}><HiCog className="w-4 h-4 mr-1" /> Settings</Button>
          <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Backup Now</Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@rvnp.ac.ke" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmailModal({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleSendEmail} loading={actionLoading} disabled={!email.trim()}>Send</Button>
        </div>
      </Modal>

      <Modal open={settingsModal} onClose={() => setSettingsModal(false)} title="Auto Backup Settings">
        <div className="space-y-4">
          <Toggle label="Enabled" checked={autoSettings.enabled || false} onChange={v => setAutoSettings({ ...autoSettings, enabled: v })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
            <select value={autoSettings.frequency || 'daily'} onChange={e => setAutoSettings({ ...autoSettings, frequency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['daily', 'weekly', 'monthly'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <Input label="Time" value={autoSettings.time || '03:00'} onChange={e => setAutoSettings({ ...autoSettings, time: e.target.value })} />
          <Input label="Retention Count" type="number" value={autoSettings.retentionCount || 7} onChange={e => setAutoSettings({ ...autoSettings, retentionCount: +e.target.value })} />
          <Toggle label="Auto Send Email" checked={autoSettings.autoSendEmail || false} onChange={v => setAutoSettings({ ...autoSettings, autoSendEmail: v })} />
          {autoSettings.autoSendEmail && (
            <Input label="Email" type="email" value={autoSettings.autoSendEmailAddress || ''} onChange={e => setAutoSettings({ ...autoSettings, autoSendEmailAddress: e.target.value })} />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSettingsModal(false)}>Cancel</Button>
            <Button onClick={handleAutoSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}