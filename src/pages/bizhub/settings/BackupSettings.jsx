import { useEffect, useState, useRef } from 'react';
import { getBackups, getBackupSettings, updateBackupSettings, createBackup, downloadBackup, emailBackup, restoreBackup, deleteBackup, uploadBackup } from '../../../services/bizhub/backups';
import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Modal from '../../../components/bizhub/ui/Modal';
import ConfirmDialog from '../../../components/bizhub/ui/ConfirmDialog';
import Spinner from '../../../components/bizhub/ui/Spinner';
import { formatDate } from '../../../utils/bizhub/formatDate';
import { HiPlus, HiDownload, HiMail, HiRefresh, HiTrash, HiUpload } from 'react-icons/hi';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function BackupSettings({ settings, setSettings, onSave }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingSection, setSavingSection] = useState('');
  const [emailModal, setEmailModal] = useState({ open: false, id: null, filename: '' });
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ open: false, id: null, filename: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, filename: '' });
  const fileInputRef = useRef(null);

  const getVal = (key, fallback = '') => (settings && settings[key]) || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  const fetchBackups = () => {
    setLoading(true);
    getBackups({ limit: 50 })
      .then(res => setBackups(res?.data || res || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleSaveConfig = async (keys) => {
    setSavingSection('config');
    for (const key of keys) {
      if (typeof onSave === 'function') await onSave(key, settings[key] || '');
    }
    setSavingSection('');
    alert('Backup config saved!');
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try { await createBackup({}); fetchBackups(); }
    catch (e) { alert(e.message); }
    setCreating(false);
  };

  const handleDownload = async (id) => { try { await downloadBackup(id); } catch (e) { alert(e.message); } };
  const handleEmail = async () => {
    setSendingEmail(true);
    try { await emailBackup(emailModal.id, emailAddress || undefined); setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); alert('Backup sent!'); }
    catch (e) { alert(e.message); }
    setSendingEmail(false);
  };
  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreBackup(restoreConfirm.id); setRestoreConfirm({ open: false, id: null, filename: '' }); alert('Database restored!'); fetchBackups(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };
  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(deleteConfirm.id); setDeleteConfirm({ open: false, id: null, filename: '' }); fetchBackups(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('⚠️ This will overwrite ALL data. Continue?')) return;
    setActionLoading(true);
    try { await uploadBackup(file); alert('Backup restored!'); fetchBackups(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Auto Backup Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enable Auto Backup" checked={isTrue('backup_enabled')} onChange={v => { const val = v ? 'true' : 'false'; if (setSettings) setSettings(prev => ({ ...prev, backup_enabled: val })); }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
              <select value={getVal('backup_frequency', 'daily')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_frequency: e.target.value })); }}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <Input label="Notification Email" type="email" value={getVal('backup_email')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, backup_email: e.target.value })); }} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Auto backup schedule & notifications</span>
          <Button size="sm" onClick={() => handleSaveConfig(['backup_frequency', 'backup_email', 'backup_enabled'])} loading={savingSection === 'config'}>Save Config</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Create Backup</h2>
          <Button onClick={handleCreateBackup} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Upload & Restore</h2>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={actionLoading}><HiUpload className="w-4 h-4 mr-1" /> Upload Backup</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleUpload} className="hidden" />
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Files ({backups.length})</h2>
        {backups.length === 0 ? <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups yet.</p> : (
          <div className="space-y-3">
            {backups.map((b, i) => (
              <div key={b._id || i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div><p className="font-medium text-[var(--text-primary)]">📄 {b.filename}</p><p className="text-xs text-[var(--text-muted)]">{formatSize(b.size)} · {formatDate(b.createdAt, 'full')}</p></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(b._id)}><HiDownload className="w-4 h-4 mr-1" /> Download</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEmailModal({ open: true, id: b._id, filename: b.filename }); setEmailAddress(''); }}><HiMail className="w-4 h-4 mr-1" /> Email</Button>
                  <Button size="sm" variant="warning" onClick={() => setRestoreConfirm({ open: true, id: b._id, filename: b.filename })}><HiRefresh className="w-4 h-4 mr-1" /> Restore</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, id: b._id, filename: b.filename })}><HiTrash className="w-4 h-4 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={emailModal.open} onClose={() => { setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); }} title="Send Backup to Email" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Send <strong>{emailModal.filename}</strong> via email.</p>
          <Input label="Email" type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="Leave empty for default" />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => { setEmailModal({ open: false, id: null, filename: '' }); setEmailAddress(''); }}>Cancel</Button><Button onClick={handleEmail} loading={sendingEmail}>Send</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={restoreConfirm.open} onClose={() => setRestoreConfirm({ open: false, id: null, filename: '' })} onConfirm={handleRestore}
        title="⚠️ Restore Database?" message={`Restore from ${restoreConfirm.filename}? This will overwrite ALL data.`} confirmLabel="Restore" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, filename: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Delete ${deleteConfirm.filename}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}