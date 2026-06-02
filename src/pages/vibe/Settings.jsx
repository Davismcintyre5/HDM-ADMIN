import { useEffect, useState } from 'react';
import { getSettings, updateSettingsBulk } from '../../services/vibe/settings';
import Input from '../../components/vibe/ui/Input';
import Toggle from '../../components/vibe/ui/Toggle';
import Button from '../../components/vibe/ui/Button';
import Spinner from '../../components/vibe/ui/Spinner';
import Card from '../../components/vibe/ui/Card';
import { formatDate } from '../../utils/vibe/formatDate';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'footer', label: 'Footer' },
  { key: 'features', label: 'Features' },
  { key: 'cookies', label: 'Cookies' },
  { key: 'legal', label: 'Legal' },
  { key: 'ai', label: 'AI' },
  { key: 'backup', label: 'Backup' },
];

const AI_FEATURES = [
  { key: 'ai_chat_enabled', label: 'AI Chat', desc: 'General Q&A, captions, bio help' },
  { key: 'ai_moderation_enabled', label: 'AI Moderation', desc: 'Content moderation (text, image, video)' },
  { key: 'ai_recommendations_enabled', label: 'AI Recommendations', desc: 'Personalized feed & recommendations' },
  { key: 'ai_creation_enabled', label: 'AI Creation', desc: 'Content creation (hashtags, captions, descriptions)' },
  { key: 'ai_analytics_enabled', label: 'AI Analytics', desc: 'User analytics (engagement insights, growth)' },
  { key: 'ai_search_enabled', label: 'AI Search', desc: 'Semantic, visual, and voice search' },
  { key: 'ai_accessibility_enabled', label: 'AI Accessibility', desc: 'Alt text, captions, text-to-speech' },
  { key: 'ai_ads_enabled', label: 'AI Ads', desc: 'Ad targeting & copy' },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    getSettings()
      .then(res => setSettings(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const section = settings[activeTab] || {};
      const settingsArray = Object.entries(section).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? String(value) : String(value),
        category: activeTab,
      }));
      await updateSettingsBulk({ settings: settingsArray, category: activeTab });
      alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved`);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <Button key={t.key} size="sm" variant={activeTab === t.key ? 'primary' : 'secondary'} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        {/* General */}
        {activeTab === 'general' && (
          <div className="space-y-4 max-w-2xl">
            <Input label="Site Name" value={settings.general?.site_name || ''} onChange={(e) => updateField('general', 'site_name', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Site Description</label>
              <textarea value={settings.general?.site_description || ''} onChange={(e) => updateField('general', 'site_description', e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.general?.primary_color || '#3B82F6'} onChange={(e) => updateField('general', 'primary_color', e.target.value)} className="h-10 w-16 rounded border cursor-pointer" />
                  <Input value={settings.general?.primary_color || ''} onChange={(e) => updateField('general', 'primary_color', e.target.value)} className="flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.general?.secondary_color || '#8B5CF6'} onChange={(e) => updateField('general', 'secondary_color', e.target.value)} className="h-10 w-16 rounded border cursor-pointer" />
                  <Input value={settings.general?.secondary_color || ''} onChange={(e) => updateField('general', 'secondary_color', e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <Input label="Logo URL" value={settings.general?.logo_url || ''} onChange={(e) => updateField('general', 'logo_url', e.target.value)} />
            <Input label="Favicon URL" value={settings.general?.favicon_url || ''} onChange={(e) => updateField('general', 'favicon_url', e.target.value)} />
            <Input label="Support Email" type="email" value={settings.general?.support_email || ''} onChange={(e) => updateField('general', 'support_email', e.target.value)} />
            <Input label="Support Phone" value={settings.general?.support_phone || ''} onChange={(e) => updateField('general', 'support_phone', e.target.value)} />
          </div>
        )}

        {/* Footer */}
        {activeTab === 'footer' && (
          <div className="space-y-4 max-w-2xl">
            <Input label="Copyright" value={settings.footer?.footer_copyright || ''} onChange={(e) => updateField('footer', 'footer_copyright', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Footer Links (JSON)</label>
              <textarea value={settings.footer?.footer_links || ''} onChange={(e) => updateField('footer', 'footer_links', e.target.value)} rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Facebook" value={settings.footer?.social_facebook || ''} onChange={(e) => updateField('footer', 'social_facebook', e.target.value)} />
              <Input label="Twitter" value={settings.footer?.social_twitter || ''} onChange={(e) => updateField('footer', 'social_twitter', e.target.value)} />
              <Input label="Instagram" value={settings.footer?.social_instagram || ''} onChange={(e) => updateField('footer', 'social_instagram', e.target.value)} />
              <Input label="TikTok" value={settings.footer?.social_tiktok || ''} onChange={(e) => updateField('footer', 'social_tiktok', e.target.value)} />
              <Input label="YouTube" value={settings.footer?.social_youtube || ''} onChange={(e) => updateField('footer', 'social_youtube', e.target.value)} />
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === 'features' && (
          <div className="space-y-3 max-w-2xl">
            <Toggle label="Reels" checked={settings.features?.features_reels === 'true'} onChange={(v) => updateField('features', 'features_reels', v ? 'true' : 'false')} />
            <Toggle label="Marketplace" checked={settings.features?.features_marketplace === 'true'} onChange={(v) => updateField('features', 'features_marketplace', v ? 'true' : 'false')} />
            <Toggle label="Groups" checked={settings.features?.features_groups === 'true'} onChange={(v) => updateField('features', 'features_groups', v ? 'true' : 'false')} />
            <Toggle label="Live Streaming" checked={settings.features?.features_live === 'true'} onChange={(v) => updateField('features', 'features_live', v ? 'true' : 'false')} />
            <Toggle label="Stories" checked={settings.features?.features_stories === 'true'} onChange={(v) => updateField('features', 'features_stories', v ? 'true' : 'false')} />
            <Toggle label="Messaging" checked={settings.features?.features_messaging === 'true'} onChange={(v) => updateField('features', 'features_messaging', v ? 'true' : 'false')} />
          </div>
        )}

        {/* Cookies */}
        {activeTab === 'cookies' && (
          <div className="space-y-4 max-w-2xl">
            <Toggle label="Cookies Enabled" checked={settings.cookies?.cookies_enabled === 'true'} onChange={(v) => updateField('cookies', 'cookies_enabled', v ? 'true' : 'false')} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cookie Message</label>
              <textarea value={settings.cookies?.cookies_message || ''} onChange={(e) => updateField('cookies', 'cookies_message', e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm" />
            </div>
          </div>
        )}

        {/* Legal */}
        {activeTab === 'legal' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Terms of Service</h3>
              <textarea value={settings.legal?.terms_of_service || ''} onChange={(e) => updateField('legal', 'terms_of_service', e.target.value)} rows={10}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Privacy Policy</h3>
              <textarea value={settings.legal?.privacy_policy || ''} onChange={(e) => updateField('legal', 'privacy_policy', e.target.value)} rows={10}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Community Guidelines</h3>
              <textarea value={settings.legal?.community_guidelines || ''} onChange={(e) => updateField('legal', 'community_guidelines', e.target.value)} rows={8}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm" />
            </div>
          </div>
        )}

        {/* AI */}
        {activeTab === 'ai' && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-4 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">HDM AI Master</h3>
                    <p className="text-xs text-[var(--text-muted)]">Controls all AI features across the platform</p>
                  </div>
                </div>
                <Toggle checked={(settings.ai?.ai_enabled || 'true') === 'true'} onChange={(v) => updateField('ai', 'ai_enabled', v ? 'true' : 'false')} />
              </div>
              {(settings.ai?.ai_enabled || 'true') === 'true' && (
                <div className="ml-10 space-y-3">
                  <Input label="Base URL" value={settings.ai?.ai_base_url || ''} onChange={(e) => updateField('ai', 'ai_base_url', e.target.value)} placeholder="https://hdmai-server.onrender.com/api/v1" />
                  <Input label="API Key" type="password" value={settings.ai?.ai_api_key || ''} onChange={(e) => updateField('ai', 'ai_api_key', e.target.value)} placeholder="hdm_vib_..." />
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const baseUrl = (settings.ai?.ai_base_url || 'https://hdmai-server.onrender.com').replace(/\/api\/v1\/?$/, '');
                      const res = await fetch(baseUrl + '/health');
                      const data = await res.json();
                      if (data.status === 'healthy' || data.success) alert('✅ Connection successful!');
                      else throw new Error('Unexpected response');
                    } catch { alert('❌ Connection failed. Check the Base URL and try again.'); }
                  }}>Test Connection</Button>
                </div>
              )}
            </div>
            {(settings.ai?.ai_enabled || 'true') === 'true' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[var(--text-primary)]">AI Features</h3>
                <p className="text-xs text-[var(--text-muted)]">Individual AI features — all depend on the master toggle above</p>
                {AI_FEATURES.map(f => (
                  <Toggle key={f.key} label={f.label} description={f.desc} checked={(settings.ai?.[f.key] || 'true') === 'true'} onChange={(v) => updateField('ai', f.key, v ? 'true' : 'false')} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backup */}
        {activeTab === 'backup' && (
          <BackupTab settings={settings} updateField={updateField} />
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            💾 Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BackupTab({ settings, updateField }) {
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    setBackupsLoading(true);
    try {
      const token = localStorage.getItem('vibe_token');
      const res = await fetch('http://localhost:5000/api/v1/admin/backup', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setBackups(data.data || data || []);
    } catch (err) { console.error(err); }
    setBackupsLoading(false);
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleManualBackup = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('vibe_token');
      const res = await fetch('http://localhost:5000/api/v1/admin/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success || data.status === 'success') {
        alert('Backup created successfully!');
        fetchBackups();
      } else {
        throw new Error(data.message || 'Backup failed');
      }
    } catch (err) { alert(err.message); }
    setCreating(false);
  };

  const backup = settings.backup || {};

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Backup Settings */}
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💾</span>
          <h3 className="font-semibold text-[var(--text-primary)]">System Backup</h3>
        </div>
        <div className="space-y-3">
          <Toggle label="Backup Enabled" checked={(backup.backup_enabled || 'true') === 'true'} onChange={(v) => updateField('backup', 'backup_enabled', v ? 'true' : 'false')} />
          <Toggle label="Auto Backup" description="Automatically create backups on schedule" checked={(backup.backup_auto_enabled || 'false') === 'true'} onChange={(v) => updateField('backup', 'backup_auto_enabled', v ? 'true' : 'false')} />
          {(backup.backup_auto_enabled || 'false') === 'true' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                <select value={backup.backup_frequency || 'daily'} onChange={(e) => updateField('backup', 'backup_frequency', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <Input label="Time (UTC)" value={backup.backup_time || '03:00'} onChange={(e) => updateField('backup', 'backup_time', e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Retention (Days)" type="number" value={backup.backup_retention_days || '30'} onChange={(e) => updateField('backup', 'backup_retention_days', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Storage Location</label>
              <select value={backup.backup_storage || 'local'} onChange={(e) => updateField('backup', 'backup_storage', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="local">Local</option>
                <option value="s3">S3 (Future)</option>
              </select>
            </div>
          </div>
          <Toggle label="Include Media Files" checked={(backup.backup_include_media || 'false') === 'true'} onChange={(v) => updateField('backup', 'backup_include_media', v ? 'true' : 'false')} />
        </div>
        <div className="mt-4">
          <Button onClick={handleManualBackup} loading={creating} variant="outline">💾 Create Manual Backup Now</Button>
        </div>
      </div>

      {/* Backup History */}
      <div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">📋 Backup History</h3>
        {backupsLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        ) : backups.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No backups yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Storage</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {backups.map((b, i) => {
                  const downloadUrl = b.fileUrl || b.filePath || b.url || b.downloadUrl;
                  const isCloud = (b.filePath || b.fileUrl || '').includes('cloudinary');
                  const sizeKB = b.fileSize ? (b.fileSize / 1024).toFixed(1) : null;
                  const sizeMB = sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) : null;
                  return (
                    <tr key={b._id || i} className="hover:bg-[var(--bg-secondary)]">
                      <td className="px-4 py-2 text-[var(--text-primary)] whitespace-nowrap">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-2 text-[var(--text-primary)] capitalize">{b.type || 'system'}</td>
                      <td className="px-4 py-2 text-[var(--text-primary)] whitespace-nowrap">
                        {sizeMB ? `${sizeMB} MB` : sizeKB ? `${sizeKB} KB` : '—'}
                      </td>
                      <td className="px-4 py-2 text-[var(--text-primary)] whitespace-nowrap">
                        {isCloud ? '☁️ Cloud' : '💻 Local'}
                      </td>
                      <td className="px-4 py-2">{b.status === 'completed' ? '✅' : '❌'}</td>
                      <td className="px-4 py-2">
                        <Button size="sm" variant="secondary" onClick={() => {
                          if (downloadUrl) window.open(downloadUrl, '_blank');
                          else alert('No download URL available');
                        }}>📥</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Section */}
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📥</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Import Data</h3>
        </div>
        <ImportSection />
      </div>
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

  const collections = [
    'users', 'posts', 'comments', 'stories', 'groups',
    'settings', 'reports', 'notifications', 'marketplace', 'tags', 'payments'
  ];

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { setError('File too large. Max 200MB'); return; }
    if (!f.name.endsWith('.json')) { setError('Only JSON files allowed'); return; }
    setFile(f); setError(''); setResult(null);
  };

  const handleImport = async () => {
    if (!file) { setError('Please select a file'); return; }
    setImporting(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('vibe_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);
      formData.append('mode', mode);
      const res = await fetch('http://localhost:5000/api/v1/admin/backup/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success || data.status === 'success') {
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
      {error && <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
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
            <input type="radio" name="importMode" value="merge" checked={mode === 'merge'} onChange={() => setMode('merge')} className="text-purple-600" />
            <span className="text-sm text-[var(--text-primary)]">Merge (update existing, add new)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="importMode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="text-purple-600" />
            <span className="text-sm text-[var(--text-primary)]">Replace (delete all, then import)</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">File (JSON, max 200MB)</label>
        <input type="file" accept=".json" onChange={handleFileChange}
          className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 dark:file:bg-purple-900/20 file:text-purple-700 dark:file:text-purple-400" />
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