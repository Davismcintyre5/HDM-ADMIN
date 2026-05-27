import { useEffect, useState } from 'react';
import { getSettings } from '../../../services/vault/settings';
import Toggle from '../../../components/vault/ui/Toggle';
import Input from '../../../components/vault/ui/Input';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';
import api from '../../../services/vault/api';

const PLATFORMS = [
  { key: 'windows', label: 'Windows', desc: 'Windows 10/11 64-bit', badge: '.exe' },
  { key: 'macos', label: 'macOS', desc: 'macOS 12+', badge: '.dmg' },
  { key: 'linux', label: 'Linux', desc: 'Ubuntu, Debian, Fedora', badge: '.AppImage' },
  { key: 'chrome', label: 'Chrome Extension', desc: 'Chrome Web Store', badge: 'Extension' },
  { key: 'firefox', label: 'Firefox Add-on', desc: 'Mozilla Add-ons', badge: 'Extension' },
  { key: 'ios', label: 'iOS', desc: 'iPhone & iPad', badge: 'App Store' },
  { key: 'android', label: 'Android', desc: 'Android 8.0+', badge: 'APK' },
];

export default function DownloadsSettings() {
  const [downloads, setDownloads] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => setDownloads(s.downloads || { enabled: false, platforms: {} }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateEnabled = (value) => setDownloads(prev => ({ ...prev, enabled: value }));
  const updatePlatform = (key, field, value) => {
    setDownloads(prev => ({
      ...prev,
      platforms: { ...prev.platforms, [key]: { ...prev.platforms[key], [field]: value } }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/downloads', downloads);
      alert('Saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!downloads) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">📥 Downloads Section</h3>
        <Toggle
          label="Show Downloads on Landing Page"
          checked={downloads.enabled || false}
          onChange={updateEnabled}
        />

        {downloads.enabled && (
          <div className="mt-4 space-y-4">
            <h4 className="text-sm font-medium text-[var(--text-secondary)]">Platforms</h4>
            {PLATFORMS.map(p => {
              const platform = downloads.platforms?.[p.key] || { enabled: false, url: '', label: p.desc, badge: p.badge };
              return (
                <div key={p.key} className="p-3 border border-[var(--border-color)] rounded-lg space-y-2">
                  <Toggle
                    label={p.label}
                    description={p.desc}
                    checked={platform.enabled || false}
                    onChange={(v) => updatePlatform(p.key, 'enabled', v)}
                  />
                  {platform.enabled && (
                    <div className="ml-6 space-y-2">
                      <Input
                        label="Download URL"
                        value={platform.url || ''}
                        onChange={(e) => updatePlatform(p.key, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                      <Input
                        label="Button Label"
                        value={platform.label || ''}
                        onChange={(e) => updatePlatform(p.key, 'label', e.target.value)}
                        placeholder={p.desc}
                      />
                      <Input
                        label="Badge"
                        value={platform.badge || ''}
                        onChange={(e) => updatePlatform(p.key, 'badge', e.target.value)}
                        placeholder={p.badge}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <Button onClick={handleSave} loading={saving}>💾 Save Downloads</Button>
    </div>
  );
}