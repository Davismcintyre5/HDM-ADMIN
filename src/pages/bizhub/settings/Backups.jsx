import { useEffect, useState } from 'react';
import { getBackups, createBackup, downloadBackup, restoreBackup, deleteBackup } from '../../../services/bizhub/backups';
import Card from '../../../components/bizhub/ui/Card';
import Table from '../../../components/bizhub/ui/Table';
import Badge from '../../../components/bizhub/ui/Badge';
import Button from '../../../components/bizhub/ui/Button';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Input from '../../../components/bizhub/ui/Input';
import ConfirmDialog from '../../../components/bizhub/ui/ConfirmDialog';
import { formatDate } from '../../../utils/bizhub/formatDate';
import { HiDownload, HiRefresh, HiTrash, HiPlus, HiClock } from 'react-icons/hi';

const BASE_URL = import.meta.env.VITE_BIZHUB_API || 'http://localhost:5000/api/admin';

function getToken() {
  return localStorage.getItem('bizhub_token');
}

function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

export default function BackupsSettings() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [autoSettings, setAutoSettings] = useState({ enabled: false, frequency: 'daily', time: '02:00', retentionDays: 30 });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState({ open: false, id: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then(res => setBackups(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBackups();
    fetch(`${BASE_URL}/backups/settings`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setAutoSettings({
          enabled: data.enabled || false,
          frequency: data.frequency || 'daily',
          time: data.time || '02:00',
          retentionDays: data.retentionDays || 30,
        });
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try { await createBackup(); fetchBackups(); alert('Backup created!'); }
    catch (err) { alert(err.message); }
    setCreating(false);
  };

  const handleDownload = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/backups/${id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleRestore = async () => {
    try { await restoreBackup(confirmRestore.id); setConfirmRestore({ open: false, id: null }); alert('Restore completed!'); fetchBackups(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchBackups(); }
    catch (err) { alert(err.message); }
  };

  const handleSaveAutoSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch(`${BASE_URL}/backups/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(autoSettings),
      });
      alert('Auto-backup settings saved');
    } catch (err) { alert(err.message); }
    setSavingSettings(false);
  };

  const columns = [
    { key: 'type', label: 'Type', render: (row) => <Badge variant="teal">{row.type || 'manual'}</Badge> },
    { key: 'filename', label: 'File', render: (row) => (
      <span className="text-xs font-mono text-[var(--text-primary)] truncate max-w-[200px] block">{row.filename || '—'}</span>
    )},
    { key: 'size', label: 'Size', render: (row) => {
      if (!row.size) return '—';
      const kb = row.size / 1024;
      return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
    }},
    { key: 'systems', label: 'Modules', render: (row) => (
      <div className="flex gap-1 flex-wrap">{(row.systems || []).map(s => <Badge key={s} variant="gradient" className="text-[10px]">{s}</Badge>)}</div>
    )},
    { key: 'status', label: 'Status', render: (row) => row.status === 'completed' ? '✅' : '⏳'},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'DD/MM/YYYY HH:mm') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id)}><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmRestore({ open: true, id: row._id })}><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiClock className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-[var(--text-primary)]">Auto-Backup</h3>
        </div>
        {settingsLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading settings...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Toggle label="Enable Auto-Backup" checked={autoSettings.enabled} onChange={(v) => setAutoSettings(p => ({ ...p, enabled: v }))} />
                {autoSettings.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                      <select value={autoSettings.frequency} onChange={(e) => setAutoSettings(p => ({ ...p, frequency: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <Input label="Time (HH:mm)" value={autoSettings.time} onChange={(e) => setAutoSettings(p => ({ ...p, time: e.target.value }))} placeholder="02:00" />
                  </>
                )}
              </div>
              {autoSettings.enabled && (
                <div className="space-y-3">
                  <Input label="Retention (Days)" type="number" value={autoSettings.retentionDays} onChange={(e) => setAutoSettings(p => ({ ...p, retentionDays: Number(e.target.value) }))} />
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={handleSaveAutoSettings} loading={savingSettings}>Save Auto-Backup Settings</Button>
            </div>
          </>
        )}
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Backup History</h3>
          <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
        </div>
        <Card>
          <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📥</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Import Data</h3>
        </div>
        <ImportSection />
      </Card>

      <ConfirmDialog open={confirmRestore.open} onClose={() => setConfirmRestore({ open: false, id: null })} title="Restore Backup" message="Restore from this backup? Current data will be overwritten." confirmLabel="Restore" variant="warning" onConfirm={handleRestore} />
      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Backup" message="Permanently delete this backup?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}

function ImportSection() {
  const [collection, setCollection] = useState('users');
  const [mode, setMode] = useState('merge');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const collections = ['users', 'subscriptions', 'systems', 'content', 'payments', 'settings'];

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { setError('File too large. Max 200MB'); return; }
    if (!f.name.endsWith('.json') && !f.name.endsWith('.zip')) { setError('Only JSON or ZIP files allowed'); return; }
    setFile(f); setError(''); setResult(null);
  };

  const handleImport = async () => {
    if (!file) { setError('Please select a file'); return; }
    setImporting(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);
      formData.append('mode', mode);
      const res = await fetch(`${BASE_URL}/backups/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data || data);
        alert('Import completed!');
      } else {
        throw new Error(data.message || 'Import failed');
      }
    } catch (err) { setError(err.message); }
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-100 dark:bg-red-900/20 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Collection</label>
        <select value={collection} onChange={(e) => setCollection(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
          {collections.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="importMode" value="merge" checked={mode === 'merge'} onChange={() => setMode('merge')} className="text-teal-600" />
            <span className="text-sm">Merge (update existing, add new)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="importMode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="text-teal-600" />
            <span className="text-sm">Replace (delete all, then import)</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">File (JSON/ZIP, max 200MB)</label>
        <input type="file" accept=".json,.zip" onChange={handleFileChange}
          className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 dark:file:bg-teal-900/20 file:text-teal-700 dark:file:text-teal-400" />
        {file && <p className="text-xs text-[var(--text-muted)] mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
      </div>
      <Button onClick={handleImport} loading={importing} disabled={!file}>📥 Import Data</Button>
      {result && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Import Results</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {result.inserted !== undefined && <div className="flex items-center gap-2"><span>✅</span> Inserted: <span className="font-medium">{result.inserted}</span></div>}
            {result.updated !== undefined && <div className="flex items-center gap-2"><span>✅</span> Updated: <span className="font-medium">{result.updated}</span></div>}
            {result.skipped !== undefined && <div className="flex items-center gap-2"><span>⏭️</span> Skipped: <span className="font-medium">{result.skipped}</span></div>}
            {result.errors !== undefined && <div className="flex items-center gap-2"><span>❌</span> Errors: <span className="font-medium">{result.errors}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}