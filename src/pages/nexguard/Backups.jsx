import { useState, useEffect, useRef } from 'react';
import { getBackups, getBackupSettings, updateBackupSettings, triggerBackup, uploadBackup, downloadBackup, sendBackupEmail, restoreBackup, deleteBackup } from '../../services/nexguard/backups';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Toggle from '../../components/nexguard/ui/Toggle';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Pagination from '../../components/nexguard/ui/Pagination';
import Spinner from '../../components/nexguard/ui/Spinner';
import { formatDate } from '../../utils/nexguard/formatDate';
import { formatBytes } from '../../utils/nexguard/formatters';
import { HiPlus, HiDownload, HiMail, HiRefresh, HiTrash, HiUpload, HiEye } from 'react-icons/hi';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState({ autoBackup: false, frequency: 'daily', sendToEmail: false, emailRecipients: [] });
  const [emailRecipientsStr, setEmailRecipientsStr] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, backup: null });
  const [emailModal, setEmailModal] = useState({ open: false, id: null, filename: '' });
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ open: false, id: null, filename: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, filename: '' });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getBackups({ page: 1, limit: 50 }).catch(() => ({ data: [] })),
      getBackupSettings().catch(() => ({ data: {} })),
    ]).then(([b, s]) => {
      const bData = b?.data || b || [];
      setBackups(Array.isArray(bData) ? bData : bData.backups || []);
      setPagination(bData.meta || bData.pagination || { page: 1, pages: 1 });
      
      const sData = s?.data || s || {};
      setSettings({
        autoBackup: sData.autoBackup || false,
        frequency: sData.frequency || 'daily',
        sendToEmail: sData.sendToEmail || false,
        emailRecipients: sData.emailRecipients || [],
      });
      setEmailRecipientsStr((sData.emailRecipients || []).join(', '));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateBackupSettings({
        ...settings,
        emailRecipients: emailRecipientsStr.split(',').map(e => e.trim()).filter(Boolean),
      });
      alert('Backup settings saved!');
      fetchData();
    } catch (e) { alert(e.message); }
    setSavingSettings(false);
  };

  const handleCreate = async () => { setCreating(true); try { await triggerBackup(); fetchData(); } catch (e) { alert(e.message); } setCreating(false); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('⚠️ Upload and restore this backup? This will overwrite current data.')) return;
    setUploading(true);
    try { await uploadBackup(file); alert('Backup uploaded and restored!'); fetchData(); }
    catch (err) { alert(err.message); }
    setUploading(false);
  };

  const handleDownload = (backup) => {
    if (backup.location) window.open(backup.location, '_blank');
    else if (backup._id) downloadBackup(backup._id).catch(e => alert(e.message));
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    try { await sendBackupEmail(emailModal.id, emailAddress || undefined); setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); alert('Backup sent!'); }
    catch (e) { alert(e.message); }
    setSendingEmail(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreBackup(restoreConfirm.id); setRestoreConfirm({ open: false, id: null, filename: '' }); alert('Database restored!'); fetchData(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(deleteConfirm.id); setDeleteConfirm({ open: false, id: null, filename: '' }); fetchData(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Backups</h1>

      {/* Settings */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Auto Backup Settings</h2>
        <div className="space-y-4">
          <Toggle label="Auto Backup" checked={settings.autoBackup} onChange={v => setSettings(prev => ({ ...prev, autoBackup: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
              <select value={settings.frequency} onChange={e => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <Toggle label="Send to Email" checked={settings.sendToEmail} onChange={v => setSettings(prev => ({ ...prev, sendToEmail: v }))} />
          {settings.sendToEmail && (
            <Input label="Email Recipients (comma separated)" value={emailRecipientsStr} onChange={e => setEmailRecipientsStr(e.target.value)} placeholder="admin@nexguard.io, backup@nexguard.io" />
          )}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-[var(--border-color)]">
          <Button size="sm" onClick={handleSaveSettings} loading={savingSettings}>Save Settings</Button>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Create Backup</h3>
          <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
        </Card>
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Upload Backup</h3>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={uploading}><HiUpload className="w-4 h-4 mr-1" /> Upload .json File</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Files ({backups.length})</h2>
        {backups.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups yet. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {backups.map((b, i) => (
              <div key={b._id || i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{b.filename}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                      <span>{formatBytes(b.size)}</span>
                      <Badge variant={b.type === 'auto' ? 'info' : 'default'}>{b.type || 'manual'}</Badge>
                      <Badge variant={b.status === 'completed' ? 'success' : 'warning'}>{b.status}</Badge>
                      <span>{formatDate(b.createdAt)}</span>
                      {b.createdBy?.name && <span>by {b.createdBy.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setPreviewModal({ open: true, backup: b })}><HiEye className="w-4 h-4 mr-1" /> Details</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(b)}><HiDownload className="w-4 h-4 mr-1" /> Download</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEmailModal({ open: true, id: b._id, filename: b.filename }); setEmailAddress(''); }}><HiMail className="w-4 h-4 mr-1" /> Email</Button>
                  <Button size="sm" variant="warning" onClick={() => setRestoreConfirm({ open: true, id: b._id, filename: b.filename })}><HiRefresh className="w-4 h-4 mr-1" /> Restore</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, id: b._id, filename: b.filename })}><HiTrash className="w-4 h-4 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))} />
      </Card>

      {/* Preview Modal */}
      <Modal open={previewModal.open} onClose={() => setPreviewModal({ open: false, backup: null })} title="Backup Details" size="md">
        {previewModal.backup && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Filename:</span><span className="text-[var(--text-primary)] font-medium">{previewModal.backup.filename}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Size:</span><span className="text-[var(--text-primary)]">{formatBytes(previewModal.backup.size)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type:</span><Badge variant={previewModal.backup.type === 'auto' ? 'info' : 'default'}>{previewModal.backup.type || 'manual'}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={previewModal.backup.status === 'completed' ? 'success' : 'warning'}>{previewModal.backup.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Created:</span><span className="text-[var(--text-primary)]">{formatDate(previewModal.backup.createdAt, 'full')}</span></div>
              {previewModal.backup.createdBy?.name && <div className="flex justify-between"><span className="text-[var(--text-secondary)]">By:</span><span className="text-[var(--text-primary)]">{previewModal.backup.createdBy.name} ({previewModal.backup.createdBy.email})</span></div>}
              {previewModal.backup.location && <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Location:</span><span className="text-[var(--text-primary)] text-xs truncate max-w-[200px]">{previewModal.backup.location}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      {/* Email Modal */}
      <Modal open={emailModal.open} onClose={() => { setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); }} title="Send Backup to Email" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Send <strong>{emailModal.filename}</strong> via email.</p>
          <Input label="Email (leave empty for default)" type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="admin@nexguard.io" />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => { setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); }}>Cancel</Button><Button onClick={handleEmail} loading={sendingEmail}>Send</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={restoreConfirm.open} onClose={() => setRestoreConfirm({ open: false, id: null, filename: '' })} onConfirm={handleRestore}
        title="⚠️ Restore Backup?" message={`Restore from ${restoreConfirm.filename}? This will overwrite ALL current data.`} confirmLabel="Restore" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, filename: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Permanently delete ${deleteConfirm.filename}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}