import { useEffect, useState } from 'react';
import { getBackups, createBackup, restoreBackup } from '../../../services/marketbridge/backup';
import Card from '../../../components/marketbridge/ui/Card';
import Input from '../../../components/marketbridge/ui/Input';
import Toggle from '../../../components/marketbridge/ui/Toggle';
import Button from '../../../components/marketbridge/ui/Button';
import Modal from '../../../components/marketbridge/ui/Modal';
import Badge from '../../../components/marketbridge/ui/Badge';
import ConfirmDialog from '../../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../../utils/marketbridge/formatDate';
import { HiPlus, HiRefresh, HiDownload, HiMail, HiTrash, HiEye, HiUpload } from 'react-icons/hi';

const FREQUENCIES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function BackupSettings({ settings = {}, setSettings, onSave }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingSection, setSavingSection] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, data: null });
  const [emailModal, setEmailModal] = useState({ open: false, filename: '' });
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, filename: '' });
  const [restoreConfirm, setRestoreConfirm] = useState({ open: false, filename: '' });

  const getVal = (key, fallback = '') => (settings && settings[key]) || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then(res => setBackups(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

const handleSaveConfig = async (keys) => {
  setSavingSection('config');
  for (const key of keys) {
    const value = (settings && settings[key]) || '';
    if (typeof onSave === 'function') {
      await onSave(key, value);
    } else {
      // Direct save
      try {
        const api = (await import('../../../services/marketbridge/api')).default;
        await api.put(`/settings/${key}`, { value });
      } catch (e) {
        console.error('Save failed for:', key, e);
      }
    }
  }
  setSavingSection('');
  alert('Backup config saved!');
};

  const handleCreateBackup = async () => {
    setCreating(true);
    setCreateResult(null);
    try {
      const res = await createBackup();
      setCreateResult({ success: true, data: res?.data || res });
      fetchBackups();
    } catch (e) {
      setCreateResult({ success: false, message: e.response?.data?.message || e.message });
    }
    setCreating(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setRestoreFile(file);
  };

const handleUploadRestore = async () => {
  if (!restoreFile) return alert('Please select a file');
  if (!confirm(`⚠️ This will overwrite ALL data with ${restoreFile.name}. Continue?`)) return;
  setRestoring(true);
  try {
    const api = (await import('../../../services/marketbridge/api')).default;
    const formData = new FormData();
    formData.append('file', restoreFile);
    formData.append('dropExisting', 'true');
    formData.append('keepAdmins', 'true');
    const res = await api.post('/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert(`Database restored! ${res.data?.data?.collectionsRestored || res.data?.collectionsRestored || ''} collections, ${res.data?.data?.documentsRestored || res.data?.documentsRestored || ''} documents.`);
    setRestoreFile(null);
    fetchBackups();
  } catch (e) { alert(e.response?.data?.message || e.message); }
  setRestoring(false);
};

  const handlePreview = async (filename) => {
    try {
      const api = (await import('../../../services/marketbridge/api')).default;
      const res = await api.get(`/backup/preview/${filename}`);
      setPreviewModal({ open: true, data: res?.data?.data || res?.data });
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleDownload = async (filename) => {
    try {
      const token = localStorage.getItem('marketbridge_token');
      const api = (await import('../../../services/marketbridge/api')).default;
      const response = await fetch(`${api.defaults.baseURL}/backup/download/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailResult(null);
    try {
      const api = (await import('../../../services/marketbridge/api')).default;
      await api.post('/backup/send-email', { filename: emailModal.filename, email: emailAddress || undefined });
      setEmailResult({ success: true });
      setTimeout(() => { setEmailModal({ open: false, filename: '' }); setEmailAddress(''); setEmailResult(null); }, 1500);
    } catch (e) {
      setEmailResult({ success: false, message: e.response?.data?.message || e.message });
    }
    setSendingEmail(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const api = (await import('../../../services/marketbridge/api')).default;
      await api.delete(`/backup/${deleteConfirm.filename}`);
      setDeleteConfirm({ open: false, filename: '' });
      fetchBackups();
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreBackup(restoreConfirm.filename); setRestoreConfirm({ open: false, filename: '' }); alert('Database restored!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
{/* Section 1 — Auto Backup Config */}
<Card>
  <h2 className="font-semibold text-[var(--text-primary)] mb-4">Auto Backup Configuration</h2>
  <div className="space-y-4">
    <Toggle 
      label="Enable Auto Backup" 
      checked={isTrue('backup_enabled')} 
      onChange={v => {
        const val = v ? 'true' : 'false';
        if (setSettings) setSettings(prev => ({ ...prev, backup_enabled: val }));
        if (typeof onSave === 'function') onSave('backup_enabled', val);
      }} 
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
        <select 
          value={getVal('backup_frequency', 'daily')} 
          onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_frequency: e.target.value })); }}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
        >
          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>
      <Input 
        label="Time" 
        type="time" 
        value={getVal('backup_time', '02:00')} 
        onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_time: e.target.value })); }} 
      />
      <Input 
        label="Retention (days)" 
        type="number" 
        value={getVal('backup_retention', '30')} 
        onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_retention: e.target.value })); }} 
      />
    </div>
    <Toggle 
      label="Email on Complete" 
      checked={isTrue('backup_email_enabled')} 
      onChange={v => {
        const val = v ? 'true' : 'false';
        if (setSettings) setSettings(prev => ({ ...prev, backup_email_enabled: val }));
      }} 
    />
    {isTrue('backup_email_enabled') && (
      <Input 
        label="Notification Email" 
        type="email" 
        value={getVal('backup_email')} 
        onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_email: e.target.value })); }} 
      />
    )}
  </div>
  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
    <span className="text-xs text-[var(--text-muted)]">Auto backup schedule & notifications</span>
    <Button 
      size="sm" 
      onClick={() => handleSaveConfig(['backup_frequency', 'backup_time', 'backup_retention', 'backup_email', 'backup_enabled', 'backup_email_enabled'])} 
      loading={savingSection === 'config'}
    >
      Save Config
    </Button>
  </div>
</Card>

      {/* Section 2 — Create Backup + Upload & Restore (side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup Now */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Create Backup Now</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Create a manual backup immediately.</p>
          <Button onClick={handleCreateBackup} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
          {createResult?.success && (
            <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
              ✅ Backup created: {createResult.data?.filename || 'success'} ({formatSize(createResult.data?.size)})
            </div>
          )}
          {createResult && !createResult.success && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600">
              ❌ Backup failed: {createResult.message}
            </div>
          )}
        </Card>

        {/* Upload & Restore */}
        {restoreFile && (
  <div className="mb-3 space-y-2">
    <div className="text-sm text-[var(--text-primary)]">
      Selected: <strong>{restoreFile.name}</strong> ({formatSize(restoreFile.size)})
    </div>
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600 rounded" />
      <span className="text-[var(--text-secondary)]">Drop existing collections before restore</span>
    </label>
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600 rounded" />
      <span className="text-[var(--text-secondary)]">Keep existing admin accounts</span>
    </label>
  </div>
)}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Upload & Restore</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Restore database from a backup file.</p>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center mb-4">
            <HiUpload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)] mb-2">Select .json backup file</p>
            <label className="cursor-pointer inline-block px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs hover:bg-violet-700">
              Browse
              <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
          {restoreFile && (
            <div className="mb-3 text-sm text-[var(--text-primary)]">
              Selected: <strong>{restoreFile.name}</strong> ({formatSize(restoreFile.size)})
            </div>
          )}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs text-red-600 mb-3">
            ⚠️ This will overwrite all current data.
          </div>
          <Button onClick={handleUploadRestore} loading={restoring} variant="warning" disabled={!restoreFile}><HiRefresh className="w-4 h-4 mr-1" /> Restore Database</Button>
        </Card>
      </div>

      {/* Section 3 — Backup List */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Files ({backups.length})</h2>
        {backups.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Filename</th>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {backups.map((b, i) => (
                  <tr key={b.filename || i} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{b.filename}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{formatSize(b.size)}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{formatDate(b.createdAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="secondary" onClick={() => handlePreview(b.filename)}><HiEye className="w-4 h-4 mr-1" /> Preview</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleDownload(b.filename)}><HiDownload className="w-4 h-4 mr-1" /> Download</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEmailModal({ open: true, filename: b.filename }); setEmailAddress(''); setEmailResult(null); }}><HiMail className="w-4 h-4 mr-1" /> Email</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, filename: b.filename })}><HiTrash className="w-4 h-4 mr-1" /> Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal open={previewModal.open} onClose={() => setPreviewModal({ open: false, data: null })} title={`👁 Preview — ${previewModal.data?.app || 'Backup'}`} size="lg">
        {previewModal.data && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-[var(--text-secondary)]">App:</span> <span className="text-[var(--text-primary)]">{previewModal.data.app || 'MarketBridge'}</span></div>
              <div><span className="text-[var(--text-secondary)]">Version:</span> <span className="text-[var(--text-primary)]">{previewModal.data.version || '1.0.0'}</span></div>
              <div><span className="text-[var(--text-secondary)]">Created:</span> <span className="text-[var(--text-primary)]">{previewModal.data.created || 'N/A'}</span></div>
              <div><span className="text-[var(--text-secondary)]">Database:</span> <span className="text-[var(--text-primary)]">{previewModal.data.database || 'marketbridge'}</span></div>
            </div>
            {previewModal.data.collections && (
              <div>
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Collections</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                      <tr><th className="px-3 py-1 text-left">Collection</th><th className="px-3 py-1 text-right">Documents</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {Object.entries(previewModal.data.collections).map(([name, count]) => (
                        <tr key={name}><td className="px-3 py-1 text-[var(--text-primary)] capitalize">{name}</td><td className="px-3 py-1 text-right text-[var(--text-primary)]">{count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Email Modal */}
      <Modal open={emailModal.open} onClose={() => { setEmailModal({ open: false, filename: '' }); setEmailResult(null); }} title="📧 Send Backup to Email" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">File: <strong>{emailModal.filename}</strong></p>
          <Input label="Email" type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="admin@marketbridge.co.ke" />
          {emailResult?.success && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 text-sm p-3 rounded-lg">✅ Sent to {emailAddress || 'default email'}</div>}
          {emailResult && !emailResult.success && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg">❌ {emailResult.message}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setEmailModal({ open: false, filename: '' }); setEmailResult(null); }}>Cancel</Button>
            <Button onClick={handleSendEmail} loading={sendingEmail}>Send</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, filename: '' })} onConfirm={handleDelete}
        title="🗑 Delete Backup?" message={`${deleteConfirm.filename}\n\nThis cannot be undone.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}