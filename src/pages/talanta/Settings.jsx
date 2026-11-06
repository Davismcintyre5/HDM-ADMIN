// src/pages/talanta/Settings.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { HiSave, HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Button from '../../components/talanta/ui/Button';
import Input from '../../components/talanta/ui/Input';
import Spinner from '../../components/talanta/ui/Spinner';
import { useToast } from '../../context/talanta/ToastContext';
import {
  getSettings,
  updateSettings,
  settingsToMap,
} from '../../services/talanta/settings';

const GROUPS = [
  {
    id: 'brand',
    label: 'Brand',
    fields: [
      { key: 'brand.name', label: 'Name', placeholder: 'Talanta Sports City' },
      { key: 'brand.logoUrl', label: 'Logo URL', placeholder: 'https://…' },
      { key: 'brand.faviconUrl', label: 'Favicon URL', placeholder: 'https://…' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    fields: [
      { key: 'contact.supportPhone', label: 'Support phone', placeholder: '+254…' },
      { key: 'contact.email', label: 'Email', placeholder: 'info@…' },
      { key: 'contact.address', label: 'Address' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    fields: [
      { key: 'social.twitter', label: 'Twitter / X' },
      { key: 'social.instagram', label: 'Instagram' },
      { key: 'social.facebook', label: 'Facebook' },
      { key: 'social.tiktok', label: 'TikTok' },
      { key: 'social.youtube', label: 'YouTube' },
    ],
  },
];

export default function Settings() {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getSettings();
      const map = settingsToMap(list);
      setValues(map);
      setInitial(map);
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const patch = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => values[k] !== initial[k]),
    [values, initial]
  );

  const save = async () => {
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    try {
      const items = dirtyKeys.map((key) => {
        const group = key.split('.')[0] || 'general';
        return { key, value: values[key], group };
      });
      await updateSettings(items);
      setInitial({ ...values });
      toast.success(`Saved ${dirtyKeys.length} setting${dirtyKeys.length !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-20">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Brand, contact and social settings for the public site
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
            Reload
          </Button>
          <Button icon={<HiSave className="w-4 h-4" />} onClick={save} loading={saving} disabled={dirtyKeys.length === 0}>
            Save{dirtyKeys.length ? ` (${dirtyKeys.length})` : ''}
          </Button>
        </div>
      </div>

      {GROUPS.map((group) => (
        <Card key={group.id} title={group.label}>
          <div className="space-y-3">
            {group.fields.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                value={values[f.key] || ''}
                onChange={(e) => patch(f.key, e.target.value)}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}