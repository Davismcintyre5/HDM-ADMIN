import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

export default function FilesSettings({ settings, setSettings, onSave, saving }) {
  const uploads = settings.uploads || {};
  const downloads = settings.downloads || {};

  const setUpload = (key, value) => setSettings(prev => ({ ...prev, uploads: { ...prev.uploads, [key]: value } }));
  const setDownload = (platform, field, value) => setSettings(prev => ({
    ...prev, downloads: { ...prev.downloads, [platform]: { ...prev.downloads?.[platform], [field]: value } },
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Upload Limits</h2>
        <div className="space-y-4">
          <Input label="Max File Size (MB)" type="number" value={uploads.maxFileSize || ''} onChange={e => setUpload('maxFileSize', e.target.value)} />
          <Input label="Allowed Types" value={uploads.allowedTypes || ''} onChange={e => setUpload('allowedTypes', e.target.value)} placeholder="jpg,png,gif,mp4" />
          <Input label="Max Images Per Post" type="number" value={uploads.maxImagesPerPost || ''} onChange={e => setUpload('maxImagesPerPost', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Desktop App</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={downloads.desktop?.enabled || false} onChange={v => setDownload('desktop', 'enabled', v)} />
          <Input label="Label" value={downloads.desktop?.label || ''} onChange={e => setDownload('desktop', 'label', e.target.value)} />
          <Input label="URL" value={downloads.desktop?.url || ''} onChange={e => setDownload('desktop', 'url', e.target.value)} />
          <Input label="Version" value={downloads.desktop?.version || ''} onChange={e => setDownload('desktop', 'version', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Android App</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={downloads.android?.enabled || false} onChange={v => setDownload('android', 'enabled', v)} />
          <Input label="Label" value={downloads.android?.label || ''} onChange={e => setDownload('android', 'label', e.target.value)} />
          <Input label="URL" value={downloads.android?.url || ''} onChange={e => setDownload('android', 'url', e.target.value)} />
          <Input label="Version" value={downloads.android?.version || ''} onChange={e => setDownload('android', 'version', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => onSave({ uploads: settings.uploads, downloads: settings.downloads })} loading={saving} size="lg">Save Files</Button>
      </div>
    </div>
  );
}