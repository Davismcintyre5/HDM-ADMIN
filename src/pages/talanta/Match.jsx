// src/pages/talanta/Match.jsx
import { useEffect, useState, useCallback } from 'react';
import { HiSave, HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Input from '../../components/talanta/ui/Input';
import Select from '../../components/talanta/ui/Select';
import Textarea from '../../components/talanta/ui/Textarea';
import Toggle from '../../components/talanta/ui/Toggle';
import Spinner from '../../components/talanta/ui/Spinner';
import { useToast } from '../../context/talanta/ToastContext';
import { getMatch, updateMatch } from '../../services/talanta/match';
import {
  MATCH_STATUSES,
  DELIVERY_CHANNELS,
  statusVariant,
  formatMatchStatus,
} from '../../utils/talanta/constants';
import { toISODateTimeLocal } from '../../utils/talanta/formatDate';

const EMPTY_RULE = { title: '', body: '' };

export default function Match() {
  const toast = useToast();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const m = await getMatch();
      setMatch(m || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load match');
      setMatch({});
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const patch = (key, value) => setMatch((prev) => ({ ...prev, [key]: value }));
  const patchVenue = (key, value) =>
    setMatch((prev) => ({ ...prev, venue: { ...(prev.venue || {}), [key]: value } }));

  const toggleChannel = (ch) => {
    const current = match?.deliveryChannels || [];
    patch(
      'deliveryChannels',
      current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch]
    );
  };

  const addRule = () => {
    patch('rules', [...(match?.rules || []), { ...EMPTY_RULE }]);
  };

  const updateRule = (i, key, value) => {
    const rules = [...(match?.rules || [])];
    rules[i] = { ...rules[i], [key]: value };
    patch('rules', rules);
  };

  const removeRule = (i) => {
    patch('rules', (match?.rules || []).filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        kickoff: match.kickoff,
        gatesOpen: match.gatesOpen,
        saleOpensAt: match.saleOpensAt,
        venue: match.venue,
        seatType: match.seatType,
        deliveryChannels: match.deliveryChannels,
        included: match.included,
        rules: match.rules,
        status: match.status,
        published: match.published,
      };
      const updated = await updateMatch(payload);
      setMatch(updated || payload);
      toast.success('Match saved');
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Match</h1>
            {match?.status && (
              <Badge variant={statusVariant(match.status)} dot>
                {formatMatchStatus(match.status)}
              </Badge>
            )}
            {match?.published && <Badge variant="success">Published</Badge>}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Configure the singleton match shown on the public site
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
            Reload
          </Button>
          <Button icon={<HiSave className="w-4 h-4" />} onClick={save} loading={saving}>
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Teams & timing">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Home team" value={match?.homeTeam || ''} onChange={(e) => patch('homeTeam', e.target.value)} />
              <Input label="Away team" value={match?.awayTeam || ''} onChange={(e) => patch('awayTeam', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kickoff</label>
                <input
                  type="datetime-local"
                  value={toISODateTimeLocal(match?.kickoff)}
                  onChange={(e) => patch('kickoff', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Gates open</label>
                <input
                  type="datetime-local"
                  value={toISODateTimeLocal(match?.gatesOpen)}
                  onChange={(e) => patch('gatesOpen', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sale opens</label>
                <input
                  type="datetime-local"
                  value={toISODateTimeLocal(match?.saleOpensAt)}
                  onChange={(e) => patch('saleOpensAt', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
                />
              </div>
            </div>
            <Input label="Seat type" value={match?.seatType || ''} onChange={(e) => patch('seatType', e.target.value)} placeholder="Numbered / General" />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Status"
                value={match?.status || 'scheduled'}
                onChange={(e) => patch('status', e.target.value)}
                options={MATCH_STATUSES.map((s) => ({ value: s, label: formatMatchStatus(s) }))}
              />
              <div className="flex items-end pb-1">
                <Toggle
                  label="Published"
                  checked={!!match?.published}
                  onChange={(v) => patch('published', v)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Venue">
          <div className="space-y-4">
            <Input label="Name" value={match?.venue?.name || ''} onChange={(e) => patchVenue('name', e.target.value)} />
            <Input label="Address" value={match?.venue?.address || ''} onChange={(e) => patchVenue('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                step="0.000001"
                value={match?.venue?.lat ?? ''}
                onChange={(e) => patchVenue('lat', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.000001"
                value={match?.venue?.lng ?? ''}
                onChange={(e) => patchVenue('lng', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Delivery channels">
        <div className="flex flex-wrap gap-2">
          {DELIVERY_CHANNELS.map((ch) => {
            const active = (match?.deliveryChannels || []).includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-sky-500'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="What's included">
        <Textarea
          label="One item per line"
          rows={4}
          value={(match?.included || []).join('\n')}
          onChange={(e) =>
            patch('included', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))
          }
          placeholder={'Free parking\nMatch programme\n…'}
        />
      </Card>

      <Card
        title="Rules"
        actions={
          <Button size="sm" variant="outline" onClick={addRule}>+ Add rule</Button>
        }
      >
        <div className="space-y-3">
          {(match?.rules || []).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No rules yet.</p>
          ) : (
            (match.rules || []).map((r, i) => (
              <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Rule #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <Input label="Title" value={r.title || ''} onChange={(e) => updateRule(i, 'title', e.target.value)} />
                <Textarea label="Body" rows={2} value={r.body || ''} onChange={(e) => updateRule(i, 'body', e.target.value)} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}