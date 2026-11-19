import { useState } from 'react';
import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Button from '../../../components/farmvexa/ui/Button';
import {
  updateAiProvider,
  testAiProvider,
} from '../../../services/farmvexa/settings';

const FEATURES = [
  { key: 'chat', label: 'Farmer Chat', needsImage: false },
  { key: 'crop_scan', label: 'Crop Scan', needsImage: true },
  { key: 'field_scan', label: 'Field Scan', needsImage: true },
];

const PROVIDERS = ['gemini', 'hdm'];
const FRESHNESS_MINUTES = 10;

function isFresh(testedAt) {
  if (!testedAt) return false;
  return Date.now() - new Date(testedAt).getTime() <= FRESHNESS_MINUTES * 60 * 1000;
}

export default function AISettings({ settings, setSettings, onSave, saving }) {
  const ai = settings.ai || {};
  const gemini = settings.gemini || {};

  const [featureState, setFeatureState] = useState(() => {
    const initial = {};
    for (const { key } of FEATURES) {
      const f = ai[key] || {};
      initial[key] = {
        provider: f.provider || 'hdm',
        testedAt: f.testedAt || null,
        testOk: !!f.testOk,
        model: f.model || '',
        busy: false,
        error: '',
        imageFile: null,
      };
    }
    return initial;
  });

  const updateAiSection = (section, key, value) =>
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));

  const setFeature = (featureKey, patch) =>
    setFeatureState(prev => ({
      ...prev,
      [featureKey]: { ...prev[featureKey], ...patch },
    }));

  const handleTest = async (featureKey) => {
    const state = featureState[featureKey];
    setFeature(featureKey, { busy: true, error: '' });

    try {
      const payload = {
        message: featureKey === 'chat' ? 'Reply with the single word: OK' : undefined,
        imageFile: state.imageFile || undefined,
        cropType: featureKey === 'chat' ? undefined : 'tomato',
      };
      const res = await testAiProvider(featureKey, state.provider, payload);

      const resultData = res?.data || {};
      setFeature(featureKey, {
        busy: false,
        testOk: true,
        testedAt: new Date().toISOString(),
        model: resultData.model || '',
        error: '',
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Test failed';
      setFeature(featureKey, {
        busy: false,
        testOk: false,
        testedAt: new Date().toISOString(),
        error: msg,
      });
    }
  };

  const handleAssign = async (featureKey) => {
    const state = featureState[featureKey];
    setFeature(featureKey, { busy: true, error: '' });
    try {
      await updateAiProvider(featureKey, state.provider);
      setFeature(featureKey, { busy: false, error: '' });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Assignment failed';
      setFeature(featureKey, { busy: false, error: msg });
    }
  };

  const handleFile = (featureKey, file) => {
    setFeature(featureKey, { imageFile: file || null, testOk: false, testedAt: null });
  };

  const canAssign = (featureKey) => {
    const s = featureState[featureKey];
    return s.testOk && isFresh(s.testedAt) && !s.busy;
  };

  const handleSaveLegacy = () =>
    onSave({ ai: settings.ai, gemini: settings.gemini });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* -------- Per-feature provider routing -------- */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-1">
          AI Provider per Feature
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Test a provider before assigning. A passing test must be less than{' '}
          {FRESHNESS_MINUTES} minutes old.
        </p>

        <div className="space-y-4">
          {FEATURES.map(({ key, label, needsImage }) => {
            const s = featureState[key];
            const fresh = isFresh(s.testedAt);
            const ready = s.testOk && fresh;

            return (
              <div
                key={key}
                className="rounded-lg border border-[var(--border-color)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">
                    {label}
                  </span>
                  {ready ? (
                    <span className="text-xs text-emerald-600 font-medium">
                      ✓ Tested {s.model || s.provider}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">
                      {s.testedAt
                        ? s.testOk
                          ? 'Test stale — re-test'
                          : 'Last test failed'
                        : 'Not tested'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={s.provider}
                    onChange={e => {
                      setFeature(key, {
                        provider: e.target.value,
                        testOk: false,
                        testedAt: null,
                        model: '',
                        error: '',
                      });
                    }}
                    className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
                  >
                    {PROVIDERS.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {needsImage && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFile(key, e.target.files?.[0])}
                      className="text-sm"
                    />
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleTest(key)}
                    loading={s.busy}
                  >
                    Test {s.provider}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleAssign(key)}
                    loading={s.busy}
                    disabled={!canAssign(key)}
                  >
                    Assign
                  </Button>
                </div>

                {needsImage && !s.imageFile && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Upload a sample image to enable testing.
                  </p>
                )}

                {s.error && (
                  <p className="text-xs text-red-600 break-words">{s.error}</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* -------- Engine settings -------- */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">
          Engine Settings
        </h2>
        <div className="space-y-4">
          <Input
            label="Python AI URL"
            value={ai.pythonAiUrl || ''}
            onChange={e => updateAiSection('ai', 'pythonAiUrl', e.target.value)}
            placeholder="http://localhost:8000"
          />
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">
                Confidence Threshold
              </span>
              <span className="text-[var(--text-primary)] font-bold">
                {ai.confidenceThreshold ?? 0.75}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ai.confidenceThreshold ?? 0.75}
              onChange={e =>
                updateAiSection(
                  'ai',
                  'confidenceThreshold',
                  parseFloat(e.target.value)
                )
              }
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* -------- Daily limits -------- */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">
          Daily Limits
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Per User"
            type="number"
            value={gemini.dailyLimitPerUser || ''}
            onChange={e =>
              updateAiSection('gemini', 'dailyLimitPerUser', +e.target.value)
            }
          />
          <Input
            label="System Total"
            type="number"
            value={gemini.dailyLimitTotal || ''}
            onChange={e =>
              updateAiSection('gemini', 'dailyLimitTotal', +e.target.value)
            }
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveLegacy} loading={saving} size="lg">
          Save Engine Settings
        </Button>
      </div>
    </div>
  );
}