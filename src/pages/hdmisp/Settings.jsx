import { useEffect, useState, useMemo } from 'react';
import {
  HiSave, HiRefresh, HiCog, HiMail, HiColorSwatch,
  HiGlobe, HiCash, HiBell, HiChevronDown,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Toggle from '../../components/hdmisp/ui/Toggle';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getSettings,
  updateSetting,
  bulkUpdateSettings,
} from '../../services/hdmisp/settings';

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

const GROUPS = [
  {
    id: 'branding',
    title: 'Branding',
    icon: HiColorSwatch,
    description: 'Platform name, logo, and support contact shown to providers.',
    fields: [
      { key: 'branding.platformName', label: 'Platform name', type: 'text', placeholder: 'HDM ISP' },
      { key: 'branding.logoUrl', label: 'Logo URL', type: 'text', placeholder: 'https://…' },
      { key: 'branding.primaryColor', label: 'Primary color', type: 'color', default: '#06b6d4' },
      { key: 'support.email', label: 'Support email', type: 'text', placeholder: 'support@hdm.co.ke' },
      { key: 'support.phone', label: 'Support phone', type: 'text', placeholder: '254712345678' },
    ],
  },
  {
    id: 'general',
    title: 'General',
    icon: HiGlobe,
    description: 'Locale, timezone, and default currency.',
    fields: [
      {
        key: 'general.timezone',
        label: 'Timezone',
        type: 'select',
        options: ['Africa/Nairobi', 'Africa/Kampala', 'Africa/Dar_es_Salaam', 'Africa/Lagos', 'Africa/Accra', 'Africa/Johannesburg', 'UTC'].map((v) => ({ value: v, label: v })),
        default: 'Africa/Nairobi',
      },
      {
        key: 'general.currency',
        label: 'Default currency',
        type: 'select',
        options: ['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'].map((v) => ({ value: v, label: v })),
        default: 'KES',
      },
      {
        key: 'general.dateFormat',
        label: 'Date format',
        type: 'select',
        options: [
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        ],
        default: 'DD/MM/YYYY',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: HiCash,
    description: 'Invoice and payment behaviour.',
    fields: [
      { key: 'billing.invoiceDueDays', label: 'Invoice due (days)', type: 'number', default: 7 },
      { key: 'billing.gracePeriodDays', label: 'Grace period (days)', type: 'number', default: 3 },
      { key: 'billing.autoConfirmMpesa', label: 'Auto-confirm M-Pesa callbacks', type: 'toggle', default: true },
      { key: 'billing.taxRatePercent', label: 'Tax rate (%)', type: 'number', default: 0 },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: HiBell,
    description: 'Which system emails and SMS get sent automatically.',
    fields: [
      { key: 'notifications.emailEnabled', label: 'Email notifications', type: 'toggle', default: true },
      { key: 'notifications.smsEnabled', label: 'SMS notifications', type: 'toggle', default: false },
      { key: 'notifications.welcomeEmail', label: 'Send welcome email on provider approval', type: 'toggle', default: true },
      { key: 'notifications.paymentReceiptEmail', label: 'Send payment receipt email', type: 'toggle', default: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function coerce(value, field) {
  if (value === undefined || value === null || value === '') {
    return field.default ?? (field.type === 'toggle' ? false : '');
  }
  if (field.type === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : (field.default ?? 0);
  }
  if (field.type === 'toggle') {
    return value === true || value === 'true' || value === 1;
  }
  return value;
}

function buildInitial(settingsObj) {
  const out = {};
  for (const group of GROUPS) {
    for (const field of group.fields) {
      out[field.key] = coerce(settingsObj?.[field.key], field);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Settings() {
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [initial, setInitial] = useState({});
  const [collapsed, setCollapsed] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      const built = buildInitial(data);
      setValues(built);
      setInitial(built);
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => JSON.stringify(values[k]) !== JSON.stringify(initial[k])),
    [values, initial],
  );
  const dirtyCount = dirtyKeys.length;

  const setField = (key, value) => {
    if (!isSuperadmin) return;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setValues({ ...initial });
  };

  const saveAll = async () => {
    if (!isSuperadmin || !dirtyCount) return;
    setSaving(true);
    try {
      const patch = {};
      for (const k of dirtyKeys) patch[k] = values[k];
      // Use bulk endpoint if more than one field changed, else single PATCH.
      if (dirtyCount === 1) {
        const k = dirtyKeys[0];
        await updateSetting(k, values[k]);
      } else {
        await bulkUpdateSettings(patch);
      }
      toast.success(`Saved ${dirtyCount} setting${dirtyCount !== 1 ? 's' : ''}`);
      setInitial({ ...values });
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
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
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            <HiCog className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform-wide configuration
            {!isSuperadmin && ' (read-only — superadmin required to edit)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={load}
            loading={loading}
          >
            Reload
          </Button>
          {isSuperadmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={resetAll}
              disabled={!dirtyCount || saving}
            >
              Reset
            </Button>
          )}
          {isSuperadmin && (
            <Button
              icon={<HiSave className="w-4 h-4" />}
              onClick={saveAll}
              loading={saving}
              disabled={!dirtyCount}
            >
              Save{dirtyCount ? ` (${dirtyCount})` : ''}
            </Button>
          )}
        </div>
      </div>

      {GROUPS.map((group) => {
        const Icon = group.icon;
        const isCollapsed = collapsed[group.id];
        const groupDirty = group.fields.some((f) => dirtyKeys.includes(f.key));
        return (
          <Card key={group.id} padding={false}>
            <button
              type="button"
              onClick={() => setCollapsed((p) => ({ ...p, [group.id]: !p[group.id] }))}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                    {group.title}
                    {groupDirty && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" title="Unsaved changes" />
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{group.description}</p>
                </div>
              </div>
              <HiChevronDown
                className={`w-5 h-5 text-[var(--text-muted)] transition-transform shrink-0 ${isCollapsed ? '-rotate-90' : ''}`}
              />
            </button>

            {!isCollapsed && (
              <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[var(--border-color)]">
                {group.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    onChange={(v) => setField(field.key, v)}
                    disabled={!isSuperadmin || saving}
                    dirty={dirtyKeys.includes(field.key)}
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {isSuperadmin && dirtyCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-[var(--card-bg)] border-t border-[var(--border-color)] px-6 py-3 flex items-center justify-between gap-3 z-30">
          <p className="text-sm text-[var(--text-secondary)]">
            {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetAll} disabled={saving}>
              Reset
            </Button>
            <Button icon={<HiSave className="w-4 h-4" />} onClick={saveAll} loading={saving}>
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field renderer                                                      */
/* ------------------------------------------------------------------ */

function FieldRow({ field, value, onChange, disabled, dirty }) {
  const label = (
    <span className="flex items-center gap-2">
      {field.label}
      {dirty && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          Unsaved
        </span>
      )}
    </span>
  );

  const wrapperClass = 'max-w-xl';

  switch (field.type) {
    case 'toggle':
      return (
        <div className="flex items-center justify-between gap-4 max-w-xl">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
            {field.hint && <p className="text-xs text-[var(--text-muted)] mt-0.5">{field.hint}</p>}
          </div>
          <Toggle
            checked={!!value}
            onChange={(v) => onChange(v)}
            disabled={disabled}
          />
        </div>
      );

    case 'select':
      return (
        <div className={wrapperClass}>
          <Select
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            options={field.options || []}
            disabled={disabled}
          />
        </div>
      );

    case 'color':
      return (
        <div className={wrapperClass}>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#06b6d4'}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="h-9 w-12 rounded border border-[var(--border-color)] bg-[var(--input-bg)] cursor-pointer disabled:opacity-60"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="#06b6d4"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm font-mono disabled:opacity-60"
            />
          </div>
        </div>
      );

    case 'number':
      return (
        <div className={wrapperClass}>
          <Input
            label={label}
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={disabled}
            placeholder={field.placeholder}
          />
          {field.hint && <p className="text-xs text-[var(--text-muted)] mt-1">{field.hint}</p>}
        </div>
      );

    case 'text':
    default:
      return (
        <div className={wrapperClass}>
          <Input
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholder}
          />
          {field.hint && <p className="text-xs text-[var(--text-muted)] mt-1">{field.hint}</p>}
        </div>
      );
  }
}