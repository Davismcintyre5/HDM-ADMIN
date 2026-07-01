import { useEffect, useState, useRef } from 'react';
import { getConfig, updateConfig, toggleMaintenance } from '../../services/farmwise/system';
import { getBackupConfig, updateBackupConfig, getBackups, createBackup, downloadBackup, emailBackup, restoreBackup, deleteBackup, uploadBackup } from '../../services/farmwise/backups';
import Card from '../../components/farmwise/ui/Card';
import Input from '../../components/farmwise/ui/Input';
import Button from '../../components/farmwise/ui/Button';
import Toggle from '../../components/farmwise/ui/Toggle';
import Modal from '../../components/farmwise/ui/Modal';
import ConfirmDialog from '../../components/farmwise/ui/ConfirmDialog';
import Spinner from '../../components/farmwise/ui/Spinner';
import Badge from '../../components/farmwise/ui/Badge';
import { formatDate } from '../../utils/farmwise/formatDate';
import { HiCog, HiChip, HiMail, HiBell, HiArchive, HiDownload, HiTrash, HiRefresh, HiUpload, HiPlus } from 'react-icons/hi';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'ai', label: 'AI Config', icon: HiChip },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'notifications', label: 'Notifications', icon: HiBell },
  { key: 'backups', label: 'Backups', icon: HiArchive },
];

const FREQUENCIES = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Backup state
  const [backupConfig, setBackupConfig] = useState({ frequency: 'none', maxFiles: 30, autoEmail: false, email: '' });
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [emailModal, setEmailModal] = useState({ open: false, filename: '' });
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ open: false, filename: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, filename: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getConfig()
      .then(res => setConfig(res?.data || res || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'backups') {
      fetchBackupData();
    }
  }, [activeTab]);

  const fetchBackupData = () => {
    setBackupsLoading(true);
    Promise.all([
      getBackupConfig().catch(() => ({ data: {} })),
      getBackups().catch(() => ({ data: [] })),
    ]).then(([cfg, bks]) => {
      const c = cfg?.data || cfg || {};
      setBackupConfig({
        frequency: c.frequency || 'none',
        maxFiles: c.maxFiles || 30,
        autoEmail: c.autoEmail || false,
        email: c.email || '',
      });
      setBackups(bks?.data || bks || []);
    }).catch(console.error)
      .finally(() => setBackupsLoading(false));
  };

  const handleSave = async (data) => {
    setSaving(true);
    try { await updateConfig(data); alert('Saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleToggleMaintenance = async () => {
    setSaving(true);
    try { await toggleMaintenance(); alert('Toggled!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleSaveBackupConfig = async () => {
    setSaving(true);
    try { await updateBackupConfig(backupConfig); alert('Backup config saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try { await createBackup(); fetchBackupData(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setCreating(false);
  };

  const handleDownload = async (filename) => {
    try { await downloadBackup(filename); }
    catch (e) { alert(e.message); }
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    try { await emailBackup(emailModal.filename, emailAddress || undefined); setEmailModal({ open: false, filename: '' }); setEmailAddress(''); alert('Backup sent!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSendingEmail(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreBackup(restoreConfirm.filename); setRestoreConfirm({ open: false, filename: '' }); alert('Database restored!'); fetchBackupData(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(deleteConfirm.filename); setDeleteConfirm({ open: false, filename: '' }); fetchBackupData(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('⚠️ This will overwrite ALL data with the uploaded backup. Continue?')) return;
    setActionLoading(true);
    try { await uploadBackup(file); alert('Backup restored!'); fetchBackupData(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!config) return null;

  const c = config;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="Platform Name" value={c.platformName || ''} onChange={e => setConfig({ ...c, platformName: e.target.value })} />
          <Input label="Tagline" value={c.tagline || ''} onChange={e => setConfig({ ...c, tagline: e.target.value })} />
          <Input label="Support Email" type="email" value={c.supportEmail || ''} onChange={e => setConfig({ ...c, supportEmail: e.target.value })} />
          <Input label="Support Phone" value={c.supportPhone || ''} onChange={e => setConfig({ ...c, supportPhone: e.target.value })} />
          <Toggle label="Maintenance Mode" checked={c.maintenanceMode || false} onChange={handleToggleMaintenance} />
          <Button onClick={() => handleSave(c)} loading={saving}>Save General</Button>
        </Card>
      )}

      {activeTab === 'ai' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="System Prompt" value={c.systemPrompt || ''} onChange={e => setConfig({ ...c, systemPrompt: e.target.value })} />
          <Input label="Model" value={c.model || ''} onChange={e => setConfig({ ...c, model: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Temperature: {c.temperature ?? 0.7}</label>
            <input type="range" min="0" max="1" step="0.1" value={c.temperature ?? 0.7} onChange={e => setConfig({ ...c, temperature: +e.target.value })} className="w-full accent-emerald-600" />
          </div>
          <Toggle label="AI Features" checked={c.aiEnabled || false} onChange={v => setConfig({ ...c, aiEnabled: v })} />
          <Button onClick={() => handleSave(c)} loading={saving}>Save AI Config</Button>
        </Card>
      )}

      {activeTab === 'email' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="HDM Bridge API Key" type="password" value={c.bridgeApiKey || ''} onChange={e => setConfig({ ...c, bridgeApiKey: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Template</label>
            <textarea value={c.emailTemplate || ''} onChange={e => setConfig({ ...c, emailTemplate: e.target.value })} rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 resize-y text-sm" />
          </div>
          <Button onClick={() => handleSave(c)} loading={saving}>Save Email</Button>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="SMS Provider" value={c.smsProvider || ''} onChange={e => setConfig({ ...c, smsProvider: e.target.value })} />
          <Input label="Briefing Time" value={c.briefingTime || ''} onChange={e => setConfig({ ...c, briefingTime: e.target.value })} placeholder="08:00" />
          <Button onClick={() => handleSave(c)} loading={saving}>Save Notifications</Button>
        </Card>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Schedule Configuration */}
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Schedule Configuration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                <select value={backupConfig.frequency} onChange={e => setBackupConfig({ ...backupConfig, frequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <Input label="Max Files" type="number" value={backupConfig.maxFiles} onChange={e => setBackupConfig({ ...backupConfig, maxFiles: +e.target.value })} />
            </div>
            <div className="space-y-3 mb-4">
              <Toggle label="Auto Email" checked={backupConfig.autoEmail} onChange={v => setBackupConfig({ ...backupConfig, autoEmail: v })} />
              {backupConfig.autoEmail && (
                <Input label="Email" type="email" value={backupConfig.email} onChange={e => setBackupConfig({ ...backupConfig, email: e.target.value })} placeholder="admin@farmwise.com" />
              )}
            </div>
            <Button onClick={handleSaveBackupConfig} loading={saving}>Save Configuration</Button>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateBackup} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={actionLoading}><HiUpload className="w-4 h-4 mr-1" /> Upload & Restore</Button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleUpload} className="hidden" />
            </div>
          </Card>

          {/* Backup Files */}
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Files ({backups.length})</h2>
            {backupsLoading ? <div className="flex justify-center py-10"><Spinner size="md" /></div>
            : backups.length === 0 ? <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups yet.</p>
            : (
              <div className="space-y-3">
                {backups.map((b, i) => (
                  <div key={b.filename || i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">📄 {b.filename}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatSize(b.size)} · {formatDate(b.createdAt, 'full')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(b.filename)}><HiDownload className="w-4 h-4 mr-1" /> Download</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEmailModal({ open: true, filename: b.filename }); setEmailAddress(''); }}><HiMail className="w-4 h-4 mr-1" /> Email</Button>
                      <Button size="sm" variant="warning" onClick={() => setRestoreConfirm({ open: true, filename: b.filename })}><HiRefresh className="w-4 h-4 mr-1" /> Restore</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, filename: b.filename })}><HiTrash className="w-4 h-4 mr-1" /> Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Email Modal */}
      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, filename: '' })} title="Send Backup to Email" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Send <span className="font-medium">{emailModal.filename}</span> via email.</p>
          <Input label="Email (leave empty for default)" type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="admin@farmwise.com" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEmailModal({ open: false, filename: '' })}>Cancel</Button>
            <Button onClick={handleEmail} loading={sendingEmail}>Send</Button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirm */}
      <ConfirmDialog open={restoreConfirm.open} onClose={() => setRestoreConfirm({ open: false, filename: '' })} onConfirm={handleRestore}
        title="⚠️ Restore Database?" message={`This will replace ALL current data with the backup:\n\n${restoreConfirm.filename}\n\nThis action cannot be undone.`}
        confirmLabel="Restore" variant="warning" loading={actionLoading} />

      {/* Delete Confirm */}
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, filename: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Permanently delete:\n\n${deleteConfirm.filename}?`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}