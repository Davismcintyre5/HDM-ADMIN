import { useEffect, useState } from 'react';
import { getSettings, updateFeatures } from '../../../services/vault/settings';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';
import Badge from '../../../components/vault/ui/Badge';

const featureCards = [
  { key: 'redis', label: 'Redis', desc: 'In-memory caching for faster performance', icon: '⚡' },
  { key: 'cloudinary', label: 'Cloudinary', desc: 'Cloud media storage for uploads & backups', icon: '☁️' },
  { key: 'firebase', label: 'Firebase', desc: 'Push notifications to mobile devices', icon: '📱' },
  { key: 'brevo', label: 'Brevo', desc: 'Email & SMS notifications', icon: '✉️' },
];

export default function FeaturesSettings() {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => setFeatures(s.features || s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateFeature = (key, enabled) => {
    setFeatures(prev => ({ ...prev, [key]: { ...prev[key], enabled } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {};
      Object.keys(features).forEach(k => {
        if (featureCards.find(c => c.key === k)) {
          body[k] = { enabled: features[k]?.enabled || false };
        }
      });
      await updateFeatures(body);
      alert('Saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!features) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      {featureCards.map(card => {
        const feature = features[card.key];
        const isEnabled = feature?.enabled;
        return (
          <Card key={card.key}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{card.label}</h3>
                    <Badge variant={isEnabled ? 'success' : 'default'}>
                      {isEnabled ? 'Connected' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{card.desc}</p>
                </div>
              </div>
              <Toggle checked={isEnabled || false} onChange={(v) => updateFeature(card.key, v)} />
            </div>
          </Card>
        );
      })}
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}