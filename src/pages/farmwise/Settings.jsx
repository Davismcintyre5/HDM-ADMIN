import { useEffect, useState, useRef } from 'react';
import { getConfig, updateConfig, toggleMaintenance, getDownloads, updateDownloads } from '../../services/farmwise/system';
import { getBackupConfig, updateBackupConfig, getBackups, createBackup, downloadBackup, emailBackup, restoreBackup, deleteBackup, uploadBackup } from '../../services/farmwise/backups';
import { getCommunicationUsers, sendCommunication } from '../../services/farmwise/communication';
import Card from '../../components/farmwise/ui/Card';
import Input from '../../components/farmwise/ui/Input';
import Button from '../../components/farmwise/ui/Button';
import Toggle from '../../components/farmwise/ui/Toggle';
import Modal from '../../components/farmwise/ui/Modal';
import ConfirmDialog from '../../components/farmwise/ui/ConfirmDialog';
import Spinner from '../../components/farmwise/ui/Spinner';
import Badge from '../../components/farmwise/ui/Badge';
import { formatDate } from '../../utils/farmwise/formatDate';
import { HiCog, HiChip, HiMail, HiBell, HiArchive, HiDownload, HiTrash, HiRefresh, HiUpload, HiPlus, HiUsers } from 'react-icons/hi';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'ai', label: 'AI Config', icon: HiChip },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'notifications', label: 'Notifications', icon: HiBell },
  { key: 'downloads', label: 'Downloads', icon: HiDownload },
  { key: 'communication', label: 'Communication', icon: HiUsers },
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

  // Downloads state
  const [downloads, setDownloads] = useState({ windows: { enabled: false, url: '', version: '' }, android: { enabled: false, url: '', version: '' } });
  const [downloadsLoading, setDownloadsLoading] = useState(false);

  // Communication state
  const [commUsers, setCommUsers] = useState([]);
  const [commForm, setCommForm] = useState({ sendTo: 'all', userId: '', customEmail: '', subject: '', message: '' });
  const [commLoading, setCommLoading] = useState(false);
  const [commSending, setCommSending] = useState(false);
  const [commResult, setCommResult] = useState(null);

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
    if (activeTab === 'downloads') fetchDownloads();
    if (activeTab === 'communication') fetchCommUsers();
    if (activeTab === 'backups') fetchBackupData();
  }, [activeTab]);

  const fetchDownloads = () => {
    setDownloadsLoading(true);
    getDownloads()
      .then(res => {
        const d = res?.data || res || {};
        setDownloads({
          windows: { enabled: d.windows?.enabled || false, url: d.windows?.url || '', version: d.windows?.version || '' },
          android: { enabled: d.android?.enabled || false, url: d.android?.url || '', version: d.android?.version || '' },
        });
      })
      .catch(console.error)
      .finally(() => setDownloadsLoading(false));
  };

  const fetchCommUsers = () => {
    setCommLoading(true);
    getCommunicationUsers()
      .then(res => setCommUsers(res?.data || res || []))
      .catch(console.error)
      .finally(() => setCommLoading(false));
  };

  const fetchBackupData = () => {
    setBackupsLoading(true);
    Promise.all([
      getBackupConfig().catch(() => ({ data: {} })),
      getBackups().catch(() => ({ data: [] })),
    ]).then(([cfg, bks]) => {
      const c = cfg?.data || cfg || {};
      setBackupConfig({ frequency: c.frequency || 'none', maxFiles: c.maxFiles || 30, autoEmail: c.autoEmail || false, email: c.email || '' });
      setBackups(bks?.data || bks || []);
    }).catch(console.error).finally(() => setBackupsLoading(false));
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

  const handleSaveDownloads = async () => {
    setSaving(true);
    try { await updateDownloads(downloads); alert('Downloads saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleSendComm = async () => {
    if (!commForm.subject.trim() || !commForm.message.trim()) return alert('Subject and message required');
    if (commForm.sendTo === 'single' && !commForm.userId) return alert('Select a user');
    if (commForm.sendTo === 'custom' && !commForm.customEmail.trim()) return alert('Enter email addresses');
    setCommSending(true);
    try {
      const data = { sendTo: commForm.sendTo, subject: commForm.subject, message: commForm.message };
      if (commForm.sendTo === 'single') data.userId = commForm.userId;
      if (commForm.sendTo === 'custom') data.customEmail = commForm.customEmail;
      const res = await sendCommunication(data);
      setCommResult(res?.data || res);
      alert(res?.message || 'Email sent!');
      setCommForm({ ...commForm, subject: '', message: '' });
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setCommSending(false);
  };

  const handleSaveBackupConfig = async () => {
    setSaving(true);
    try { await updateBackupConfig(backupConfig); alert('Backup config saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleCreateBackup = async () => { setCreating(true); try { await createBackup(); fetchBackupData(); } catch (e) { alert(e.response?.data?.message || e.message); } setCreating(false); };
  const handleDownload = async (filename) => { try { await downloadBackup(filename); } catch (e) { alert(e.message); } };
  const handleEmail = async () => { setSendingEmail(true); try { await emailBackup(emailModal.filename, emailAddress || undefined); setEmailModal({ open: false, filename: '' }); setEmailAddress(''); alert('Backup sent!'); } catch (e) { alert(e.response?.data?.message || e.message); } setSendingEmail(false); };
  const handleRestore = async () => { setActionLoading(true); try { await restoreBackup(restoreConfirm.filename); setRestoreConfirm({ open: false, filename: '' }); alert('Database restored!'); fetchBackupData(); } catch (e) { alert(e.response?.data?.message || e.message); } setActionLoading(false); };
  const handleDelete = async () => { setActionLoading(true); try { await deleteBackup(deleteConfirm.filename); setDeleteConfirm({ open: false, filename: '' }); fetchBackupData(); } catch (e) { alert(e.response?.data?.message || e.message); } setActionLoading(false); };
  const handleUpload = async (e) => { const file = e.target.files?.[0]; if (!file) return; if (!confirm('⚠️ This will overwrite ALL data. Continue?')) return; setActionLoading(true); try { await uploadBackup(file); alert('Backup restored!'); fetchBackupData(); } catch (err) { alert(err.response?.data?.message || err.message); } setActionLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const formatSize = (bytes) => { if (!bytes && bytes !== 0) return '—'; if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1048576).toFixed(1)} MB`; };

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

      {/* GENERAL */}
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

      {/* AI CONFIG */}
      {activeTab === 'ai' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="System Prompt" value={c.systemPrompt || ''} onChange={e => setConfig({ ...c, systemPrompt: e.target.value })} />
          <Input label="Model" value={c.model || ''} onChange={e => setConfig({ ...c, model: e.target.value })} />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Temperature: {c.temperature ?? 0.7}</label><input type="range" min="0" max="1" step="0.1" value={c.temperature ?? 0.7} onChange={e => setConfig({ ...c, temperature: +e.target.value })} className="w-full accent-emerald-600" /></div>
          <Toggle label="AI Features" checked={c.aiEnabled || false} onChange={v => setConfig({ ...c, aiEnabled: v })} />
          <Button onClick={() => handleSave(c)} loading={saving}>Save AI Config</Button>
        </Card>
      )}

      {/* EMAIL */}
      {activeTab === 'email' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="HDM Bridge API Key" type="password" value={c.bridgeApiKey || ''} onChange={e => setConfig({ ...c, bridgeApiKey: e.target.value })} />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Template</label><textarea value={c.emailTemplate || ''} onChange={e => setConfig({ ...c, emailTemplate: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 resize-y text-sm" /></div>
          <Button onClick={() => handleSave(c)} loading={saving}>Save Email</Button>
        </Card>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4 max-w-2xl">
          <Input label="SMS Provider" value={c.smsProvider || ''} onChange={e => setConfig({ ...c, smsProvider: e.target.value })} />
          <Input label="Briefing Time" value={c.briefingTime || ''} onChange={e => setConfig({ ...c, briefingTime: e.target.value })} placeholder="08:00" />
          <Button onClick={() => handleSave(c)} loading={saving}>Save Notifications</Button>
        </Card>
      )}

      {/* DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">🖥️ Windows</h2>
            <div className="space-y-4">
              <Toggle label="Enabled" checked={downloads.windows.enabled} onChange={v => setDownloads({ ...downloads, windows: { ...downloads.windows, enabled: v } })} />
              {downloads.windows.enabled && (
                <>
                  <Input label="Download URL" value={downloads.windows.url} onChange={e => setDownloads({ ...downloads, windows: { ...downloads.windows, url: e.target.value } })} placeholder="https://releases.farmwise.co.ke/FarmWise-Setup.exe" />
                  <Input label="Version" value={downloads.windows.version} onChange={e => setDownloads({ ...downloads, windows: { ...downloads.windows, version: e.target.value } })} placeholder="1.0.0" />
                </>
              )}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">📱 Android</h2>
            <div className="space-y-4">
              <Toggle label="Enabled" checked={downloads.android.enabled} onChange={v => setDownloads({ ...downloads, android: { ...downloads.android, enabled: v } })} />
              {downloads.android.enabled && (
                <>
                  <Input label="Download URL" value={downloads.android.url} onChange={e => setDownloads({ ...downloads, android: { ...downloads.android, url: e.target.value } })} placeholder="https://play.google.com/store/apps/details?id=com.farmwise.app" />
                  <Input label="Version" value={downloads.android.version} onChange={e => setDownloads({ ...downloads, android: { ...downloads.android, version: e.target.value } })} placeholder="1.0.0" />
                </>
              )}
            </div>
          </Card>
          <Button onClick={handleSaveDownloads} loading={saving}>Save Downloads</Button>
        </div>
      )}

      {/* COMMUNICATION */}
      {activeTab === 'communication' && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Send Email</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Send To</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sendTo" value="all" checked={commForm.sendTo === 'all'} onChange={() => setCommForm({ ...commForm, sendTo: 'all' })} className="text-emerald-600" />
                    <span className="text-sm">All Users ({commUsers.length})</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sendTo" value="single" checked={commForm.sendTo === 'single'} onChange={() => setCommForm({ ...commForm, sendTo: 'single' })} className="text-emerald-600" />
                    <span className="text-sm">Specific User</span>
                  </label>
                  {commForm.sendTo === 'single' && (
                    <div className="ml-8">
                      <select value={commForm.userId} onChange={e => setCommForm({ ...commForm, userId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
                        <option value="">Select user...</option>
                        {commUsers.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>)}
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sendTo" value="custom" checked={commForm.sendTo === 'custom'} onChange={() => setCommForm({ ...commForm, sendTo: 'custom' })} className="text-emerald-600" />
                    <span className="text-sm">Custom Email(s)</span>
                  </label>
                  {commForm.sendTo === 'custom' && (
                    <div className="ml-8">
                      <Input value={commForm.customEmail} onChange={e => setCommForm({ ...commForm, customEmail: e.target.value })} placeholder="user1@test.com, user2@test.com" />
                    </div>
                  )}
                </div>
              </div>
              <Input label="Subject" value={commForm.subject} onChange={e => setCommForm({ ...commForm, subject: e.target.value })} placeholder="Email subject..." />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message</label>
                <textarea value={commForm.message} onChange={e => setCommForm({ ...commForm, message: e.target.value })} rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 resize-y text-sm" placeholder="Your message..." />
              </div>
              <Button onClick={handleSendComm} loading={commSending}>Send Email</Button>
              {commResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
                  Sent: {commResult.sent} | Failed: {commResult.failed} | Total: {commResult.total}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* BACKUPS */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
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
              {backupConfig.autoEmail && <Input label="Email" type="email" value={backupConfig.email} onChange={e => setBackupConfig({ ...backupConfig, email: e.target.value })} placeholder="admin@farmwise.com" />}
            </div>
            <Button onClick={handleSaveBackupConfig} loading={saving}>Save Configuration</Button>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateBackup} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={actionLoading}><HiUpload className="w-4 h-4 mr-1" /> Upload & Restore</Button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleUpload} className="hidden" />
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Files ({backups.length})</h2>
            {backupsLoading ? <div className="flex justify-center py-10"><Spinner size="md" /></div>
            : backups.length === 0 ? <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups yet.</p>
            : (
              <div className="space-y-3">
                {backups.map((b, i) => (
                  <div key={b.filename || i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div><p className="font-medium text-[var(--text-primary)]">📄 {b.filename}</p><p className="text-xs text-[var(--text-muted)]">{formatSize(b.size)} · {formatDate(b.createdAt, 'full')}</p></div>
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
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setEmailModal({ open: false, filename: '' })}>Cancel</Button><Button onClick={handleEmail} loading={sendingEmail}>Send</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={restoreConfirm.open} onClose={() => setRestoreConfirm({ open: false, filename: '' })} onConfirm={handleRestore}
        title="⚠️ Restore Database?" message={`This will replace ALL current data with:\n\n${restoreConfirm.filename}\n\nThis action cannot be undone.`} confirmLabel="Restore" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, filename: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Permanently delete:\n\n${deleteConfirm.filename}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}