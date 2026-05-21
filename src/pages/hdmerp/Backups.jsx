import { useEffect, useState } from 'react';
import { getBackupSettings, updateBackupSettings, getBackupHistory, runBackup, deleteBackup, downloadBackup } from '../../services/hdmerp/backups';
import Card from '../../components/hdmerp/ui/Card';
import Button from '../../components/hdmerp/ui/Button';
import Table from '../../components/hdmerp/ui/Table';
import Toggle from '../../components/hdmerp/ui/Toggle';
import Input from '../../components/hdmerp/ui/Input';
import Spinner from '../../components/hdmerp/ui/Spinner';
import ConfirmDialog from '../../components/hdmerp/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmerp/formatDate';

export default function Backups() {
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, filename: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSettings = () => {
    setSettingsLoading(true);
    getBackupSettings()
      .then(setSettings)
      .catch(err => setError(err.message))
      .finally(() => setSettingsLoading(false));
  };

  const fetchHistory = () => {
    setHistoryLoading(true);
    getBackupHistory()
      .then(setHistory)
      .catch(err => console.error(err.message))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    fetchSettings();
    fetchHistory();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateBackupSettings(settings);
      alert('Backup settings saved');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const handleRunBackup = async () => {
    setRunning(true);
    try {
      await runBackup();
      alert('Backup completed successfully');
      fetchHistory();
    } catch (e) {
      alert(e.message);
    }
    setRunning(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteBackup(confirm.id);
      fetchHistory();
    } catch (e) {
      alert(e.message);
    }
    setDeleteLoading(false);
    setConfirm({ open: false, id: null, filename: '' });
  };

  const handleDownload = async (filename, backupId) => {
    try {
      const blob = await downloadBackup(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed: ' + e.message);
    }
  };

  const handleShare = (filename) => {
    const url = `${window.location.origin}/api/admin/backups/download/${filename}`;
    if (navigator.share) {
      navigator.share({ title: 'Backup File', text: `Download backup: ${filename}`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Download link copied!'));
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const historyColumns = [
    { key: 'filename', label: 'File', render: (row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.filename || 'Unknown'}</span>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'full') },
    { key: 'size', label: 'Size', render: (row) => row.size || '-' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row.filename, row._id)}>Download</Button>
        <Button size="sm" variant="outline" onClick={() => handleShare(row.filename)}>Share</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, filename: row.filename })}>Delete</Button>
      </div>
    )},
  ];

  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Backups</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Settings</h2>
          {settingsLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : settings ? (
            <div className="space-y-4">
              <Toggle label="Enable Automatic Backups" checked={settings.enabled || false} onChange={(v) => updateSettings('enabled', v)} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                <select value={settings.frequency || 'daily'} onChange={(e) => updateSettings('frequency', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <Input label="Time (HH:mm)" value={settings.time || ''} onChange={(e) => updateSettings('time', e.target.value)} placeholder="02:00" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Keep Days" type="number" value={settings.retention?.keepDays || 30}
                  onChange={(e) => setSettings(prev => ({ ...prev, retention: { ...prev.retention, keepDays: Number(e.target.value) } }))} />
                <Input label="Max Backups" type="number" value={settings.retention?.maxBackups || 10}
                  onChange={(e) => setSettings(prev => ({ ...prev, retention: { ...prev.retention, maxBackups: Number(e.target.value) } }))} />
              </div>
              <Button onClick={handleSaveSettings} loading={saving}>Save Settings</Button>
            </div>
          ) : null}
        </Card>

        {/* History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Backup History</h2>
            <Button onClick={handleRunBackup} loading={running}>Run Backup Now</Button>
          </div>
          <Table columns={historyColumns} data={history} loading={historyLoading} emptyMessage="No backups yet." />
        </Card>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, filename: '' })}
        title="Delete Backup"
        message={`Are you sure you want to delete "${confirm.filename}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}