import Card from '../../../components/nexguard/ui/Card';
import Input from '../../../components/nexguard/ui/Input';
import Toggle from '../../../components/nexguard/ui/Toggle';
import Button from '../../../components/nexguard/ui/Button';
import { HiDesktopComputer, HiDeviceMobile } from 'react-icons/hi';

const PLATFORMS = {
  desktop: {
    label: 'Desktop Apps',
    icon: HiDesktopComputer,
    platforms: {
      windows: { label: 'Windows', ext: '.exe' },
      macos: { label: 'macOS', ext: '.dmg' },
      linux: { label: 'Linux', ext: '.AppImage' },
    },
  },
  mobile: {
    label: 'Mobile Apps',
    icon: HiDeviceMobile,
    platforms: {
      android: { label: 'Android', store: 'Play Store' },
      ios: { label: 'iOS', store: 'App Store' },
    },
  },
};

export default function DownloadsSettings({ settings, setSettings, onSave, saving }) {
  const downloads = settings.downloads || {};

  const setDownload = (category, platform, field, value) => {
    setSettings(prev => ({
      ...prev,
      downloads: {
        ...prev.downloads,
        [category]: {
          ...prev.downloads?.[category],
          [platform]: {
            ...prev.downloads?.[category]?.[platform],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    onSave({ downloads: settings.downloads });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {Object.entries(PLATFORMS).map(([categoryKey, category]) => (
        <div key={categoryKey}>
          <div className="flex items-center gap-2 mb-4">
            <category.icon className="w-5 h-5 text-[var(--text-secondary)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">{category.label}</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(category.platforms).map(([platformKey, platform]) => {
              const data = downloads[categoryKey]?.[platformKey] || {};
              return (
                <Card key={platformKey} className="!p-4">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{platform.label}</h3>
                  <div className="space-y-3">
                    <Input
                      label={platform.store ? `${platform.store} URL` : 'Download URL'}
                      value={data.url || ''}
                      onChange={e => setDownload(categoryKey, platformKey, 'url', e.target.value)}
                      placeholder={
                        platform.store
                          ? `https://play.google.com/store/apps/details?id=...`
                          : `https://nexguard.io/downloads/nexguard${platform.ext}`
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Version"
                        value={data.version || ''}
                        onChange={e => setDownload(categoryKey, platformKey, 'version', e.target.value)}
                        placeholder="1.0.0"
                      />
                      <div className="flex items-center pt-6">
                        <Toggle
                          label="Available"
                          checked={data.available || false}
                          onChange={v => setDownload(categoryKey, platformKey, 'available', v)}
                          description="Show download button"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Downloads</Button>
      </div>
    </div>
  );
}