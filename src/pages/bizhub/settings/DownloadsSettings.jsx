import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import { HiDesktopComputer, HiDeviceMobile } from 'react-icons/hi';

export default function DownloadsSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  const handleToggle = (key, checked) => {
    const value = checked ? 'true' : 'false';
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    const keys = [
      'desktop_app_enabled', 'desktop_app_label', 'desktop_app_url', 'desktop_app_version',
      'android_app_enabled', 'android_app_label', 'android_app_url', 'android_app_version',
    ];
    keys.forEach(k => onSave(k, settings[k], 'downloads', true));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Desktop */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiDesktopComputer className="w-5 h-5 text-[var(--text-secondary)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Desktop App</h2>
        </div>
        <Card>
          <div className="space-y-4">
            <Toggle
              label="Enabled"
              checked={isTrue('desktop_app_enabled')}
              onChange={v => handleToggle('desktop_app_enabled', v)}
              description="Show desktop download button"
            />
            <Input
              label="Label"
              value={getVal('desktop_app_label', 'Download for Desktop')}
              onChange={e => setSettings(prev => ({ ...prev, desktop_app_label: e.target.value }))}
            />
            <Input
              label="URL"
              value={getVal('desktop_app_url')}
              onChange={e => setSettings(prev => ({ ...prev, desktop_app_url: e.target.value }))}
              placeholder="https://bizhub.co.ke/downloads/desktop"
            />
            <Input
              label="Version"
              value={getVal('desktop_app_version', '1.0.0')}
              onChange={e => setSettings(prev => ({ ...prev, desktop_app_version: e.target.value }))}
            />
          </div>
        </Card>
      </div>

      {/* Android */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiDeviceMobile className="w-5 h-5 text-[var(--text-secondary)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Android App</h2>
        </div>
        <Card>
          <div className="space-y-4">
            <Toggle
              label="Enabled"
              checked={isTrue('android_app_enabled')}
              onChange={v => handleToggle('android_app_enabled', v)}
              description="Show android download button"
            />
            <Input
              label="Label"
              value={getVal('android_app_label', 'Get on Android')}
              onChange={e => setSettings(prev => ({ ...prev, android_app_label: e.target.value }))}
            />
            <Input
              label="URL"
              value={getVal('android_app_url')}
              onChange={e => setSettings(prev => ({ ...prev, android_app_url: e.target.value }))}
              placeholder="https://play.google.com/store/apps/details?id=..."
            />
            <Input
              label="Version"
              value={getVal('android_app_version', '1.0.0')}
              onChange={e => setSettings(prev => ({ ...prev, android_app_version: e.target.value }))}
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} loading={saving} size="lg">Save Downloads</Button>
      </div>
    </div>
  );
}