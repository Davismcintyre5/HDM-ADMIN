import Card from '../../../components/farmvexa/ui/Card';
import Button from '../../../components/farmvexa/ui/Button';

export default function LegalsSettings({ settings, setSettings, onSave, saving }) {
  const legal = settings.system?.legal || {};

  const update = (key, value) => setSettings(prev => ({
    ...prev, system: { ...prev.system, legal: { ...prev.system?.legal, [key]: value } }
  }));

  const handleSave = () => onSave({ system: { ...settings.system, legal: settings.system?.legal } });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Terms of Service</h2>
        <textarea value={legal.termsOfService || ''} onChange={e => update('termsOfService', e.target.value)} rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y" />
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Privacy Policy</h2>
        <textarea value={legal.privacyPolicy || ''} onChange={e => update('privacyPolicy', e.target.value)} rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y" />
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Cookie Policy</h2>
        <textarea value={legal.cookiePolicy || ''} onChange={e => update('cookiePolicy', e.target.value)} rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y" />
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Legals</Button>
      </div>
    </div>
  );
}