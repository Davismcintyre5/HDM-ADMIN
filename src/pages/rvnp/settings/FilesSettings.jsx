import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

export default function FilesSettings({ settings, setSettings, onSave, saving }) {
  const uploads = settings.uploads || {};
  const downloads = settings.downloads || {};

  const setUpload = (key, value) => setSettings(prev => ({ ...prev, uploads: { ...prev.uploads, [key]: value } }));
  const setDownload = (key, value) => setSettings(prev => ({ ...prev, downloads: { ...prev.downloads, [key]: value } }));

  const handleSave = () => onSave({ uploads: settings.uploads, downloads: settings.downloads });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Upload Limits</h2>
        <div className="space-y-4">
          <Input label="Max File Size (MB)" type="number" value={uploads.maxFileSizeMB || ''} onChange={e => setUpload('maxFileSizeMB', e.target.value)} />
          <Input label="Max Post Images" type="number" value={uploads.maxPostImages || ''} onChange={e => setUpload('maxPostImages', e.target.value)} />
          <Input label="Max Story Size (MB)" type="number" value={uploads.maxStorySizeMB || ''} onChange={e => setUpload('maxStorySizeMB', e.target.value)} />
          <Input label="Max Avatar Size (MB)" type="number" value={uploads.maxAvatarSizeMB || ''} onChange={e => setUpload('maxAvatarSizeMB', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Downloads</h2>
        <div className="space-y-4">
          <Toggle label="Download Page Enabled" checked={downloads.downloadPageEnabled || false} onChange={v => setDownload('downloadPageEnabled', v)} />
          <Input label="Play Store URL" value={downloads.playStoreUrl || ''} onChange={e => setDownload('playStoreUrl', e.target.value)} />
          <Input label="App Store URL" value={downloads.appStoreUrl || ''} onChange={e => setDownload('appStoreUrl', e.target.value)} />
          <Input label="APK URL" value={downloads.apkUrl || ''} onChange={e => setDownload('apkUrl', e.target.value)} />
          <Input label="Min App Version" value={downloads.minAppVersion || ''} onChange={e => setDownload('minAppVersion', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Files</Button>
      </div>
    </div>
  );
}