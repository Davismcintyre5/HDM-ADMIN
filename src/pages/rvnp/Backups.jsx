import { useState, useEffect } from 'react';
import { getBackupSettings, updateBackupSettings, getBackups, createBackup, downloadBackup, sendBackupEmail, deleteBackup, uploadRestore } from '../../services/rvnp/backups';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Toggle from '../../components/rvnp/ui/Toggle';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiUpload, HiCog } from 'react-icons/hi';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, filename: '' });
  const [emailModal, setEmailModal] = useState({ open: false, filename: '' });
  const [email, setEmail] = useState('');
  const [settingsModal, setSettingsModal] = useState(false);
  const token = localStorage.getItem('rvnp_token');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getBackups(), getBackupSettings()])
      .then(([b, s]) => {
        setBackups(b?.data?.backups || b?.data || []);
        setSettings(s?.data || s || {});
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => { setActionLoading(true); try { await createBackup(); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDownload = (filename) => { downloadBackup(filename, token).catch(err => alert(err.message)); };
  const handleEmail = async () => { setActionLoading(true); try { await sendBackupEmail(emailModal.filename, { email }); setEmailModal({ open: false, filename: '' }); setEmail(''); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDelete = async () => { setActionLoading(true); try { await deleteBackup(confirmDelete.filename); setConfirmDelete({ open: false, filename: '' }); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleSettingsSave = async () => { setActionLoading(true); try { await updateBackupSettings(settings); setSettingsModal(false); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try { await uploadRestore(formData, token); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
    e.target.value = '';
  };

  const columns = [
    { key: 'filename', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.filename || row.name}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row.filename)}><HiDownload className="w-3 h-3" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, filename: row.filename }); }}><HiMail className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, filename: row.filename })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSettingsModal(true)}><HiCog className="w-4 h-4 mr-1" /> Settings</Button>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
            <HiUpload className="w-4 h-4" /> Restore
            <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
          </label>
          <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, filename: '' })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@rvnp.ac.ke" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmailModal({ open: false, filename: '' })}>Cancel</Button>
          <Button onClick={handleEmail} loading={actionLoading} disabled={!email.trim()}>Send</Button>
        </div>
      </Modal>

      <Modal open={settingsModal} onClose={() => setSettingsModal(false)} title="Backup Settings">
        <div className="space-y-4">
          <Toggle label="Enabled" checked={settings.enabled || false} onChange={v => setSettings({ ...settings, enabled: v })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
            <select value={settings.frequency || 'daily'} onChange={e => setSettings({ ...settings, frequency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['daily', 'weekly', 'monthly'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <Toggle label="Email on Completion" checked={settings.emailOnCompletion || false} onChange={v => setSettings({ ...settings, emailOnCompletion: v })} />
          <Input label="Recipient Email" type="email" value={settings.recipientEmail || ''} onChange={e => setSettings({ ...settings, recipientEmail: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSettingsModal(false)}>Cancel</Button>
            <Button onClick={handleSettingsSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, filename: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Delete ${confirmDelete.filename}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}