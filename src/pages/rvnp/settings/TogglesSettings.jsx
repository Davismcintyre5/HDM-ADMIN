import Card from '../../../components/rvnp/ui/Card';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

const TOGGLES = [
  { key: 'userRegistration', label: 'User Registration', desc: 'Allow new users to sign up' },
  { key: 'posts', label: 'Posts', desc: 'Enable post creation and feed' },
  { key: 'stories', label: 'Stories', desc: 'Enable story creation' },
  { key: 'chat', label: 'Chat', desc: 'Enable real-time messaging' },
  { key: 'groups', label: 'Groups', desc: 'Enable community groups' },
  { key: 'marketplace', label: 'Marketplace', desc: 'Enable listings and marketplace' },
  { key: 'verification', label: 'Verification', desc: 'Enable HDM verification badges' },
  { key: 'leaderboard', label: 'Leaderboard', desc: 'Show user rankings' },
  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Take site offline for maintenance' },
  { key: 'betaFeatures', label: 'Beta Features', desc: 'Enable experimental features' },
];

export default function TogglesSettings({ settings, setSettings, onSave, saving }) {
  const toggles = settings.toggles || {};

  const setToggle = (key, value) => {
    setSettings(prev => ({ ...prev, toggles: { ...prev.toggles, [key]: value } }));
  };

  const handleSave = () => onSave(settings.toggles);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Feature Toggles</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {TOGGLES.map(item => (
            <div key={item.key} className="pt-4 first:pt-0">
              <Toggle label={item.label} checked={toggles[item.key] === true || toggles[item.key] === 'true'} onChange={v => setToggle(item.key, v)} description={item.desc} />
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Toggles</Button>
      </div>
    </div>
  );
}