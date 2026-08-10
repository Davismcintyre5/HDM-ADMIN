import { useState, useEffect } from 'react';
import { getBackups, createBackup, deleteBackup, downloadBackup, emailBackup, restoreBackup } from '../../services/hdmai2/backup';
import { getSettings, updateSetting } from '../../services/hdmai2/settings';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Toggle from '../../components/hdmai2/ui/Toggle';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiUpload, HiCog } from 'react-icons/hi';

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [backupSettings, setBackupSettings] = useState({
    backupAuto: false, backupFrequency: 24, backupAutoEmail: false, backupEmail: '',
  });
  const token = localStorage.getItem('hdmai2_token');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getBackups(), getSettings()])
      .then(([b, s]) => {
        const backupData = b?.data?.backups || b?.data || [];
        setBackups(Array.isArray(backupData) ? backupData : []);

        const settingsData = s?.data?.settings || s?.data || [];
        const map = {};
        if (Array.isArray(settingsData)) {
          settingsData.forEach(setting => { map[setting.key] = setting.value; });
        }
        setBackupSettings({
          backupAuto: map.backupAuto === true || map.backupAuto === 'true',
          backupFrequency: map.backupFrequency || 24,
          backupAutoEmail: map.backupAutoEmail === true || map.backupAutoEmail === 'true',
          backupEmail: map.backupEmail || '',
        });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try { await createBackup(); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDownload = (id, filename) => {
    downloadBackup(id, filename, token).catch(err => alert(err.message));
  };

  const handleEmail = async () => {
    setActionLoading(true);
    try { await emailBackup(emailModal.id, email); setEmailModal({ open: false, id: null }); setEmail(''); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm('Restore this backup? This will overwrite current data.')) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try { await restoreBackup(formData, token); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
    e.target.value = '';
  };

  const handleSaveSetting = async (key, value) => {
    try {
      await updateSetting(key, { value });
      setBackupSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) { alert(err.message); }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'filename', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.filename || 'backup.json'}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type || 'full'}</Badge> },
    { key: 'size', label: 'Size', render: row => <span className="text-sm">{formatSize(row.size)}</span> },
    { key: 'createdBy', label: 'Created By', render: row => <span className="text-sm">{row.createdBy?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id, row.filename)} title="Download"><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id }); }} title="Email"><HiMail className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.filename })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backup</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowSettings(!showSettings)}>
            <HiCog className="w-4 h-4 mr-1" /> {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
            <HiUpload className="w-4 h-4" /> Restore Backup
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
          <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Auto Backup Settings</h2>
          <div className="space-y-4 max-w-xl">
            <Toggle
              label="Auto Backup"
              checked={backupSettings.backupAuto}
              onChange={v => handleSaveSetting('backupAuto', v)}
              description="Automatically create backups on schedule"
            />
            {backupSettings.backupAuto && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                <select
                  value={backupSettings.backupFrequency}
                  onChange={e => handleSaveSetting('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
                >
                  {[6, 12, 24, 48, 72, 168].map(h => (
                    <option key={h} value={h}>{h === 24 ? 'Daily (24h)' : h === 168 ? 'Weekly (168h)' : h === 12 ? 'Twice Daily (12h)' : `Every ${h}h`}</option>
                  ))}
                </select>
              </div>
            )}
            <Toggle
              label="Email Backup"
              checked={backupSettings.backupAutoEmail}
              onChange={v => handleSaveSetting('backupAutoEmail', v)}
              description="Send backup to email after creation"
            />
            {backupSettings.backupAutoEmail && (
              <Input
                label="Email Address"
                type="email"
                value={backupSettings.backupEmail}
                onChange={e => setBackupSettings(prev => ({ ...prev, backupEmail: e.target.value }))}
                onBlur={e => handleSaveSetting('backupEmail', e.target.value)}
                placeholder="admin@hdm.ai"
              />
            )}
          </div>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hdm.ai" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmailModal({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleEmail} loading={actionLoading} disabled={!email.trim()}>Send</Button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}