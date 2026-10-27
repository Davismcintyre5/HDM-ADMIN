import { useEffect, useState } from 'react';
import { HiRefresh, HiChartBar } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getAttemptsAnalytics,
  getMasteryAnalytics,
  getAttendanceAnalytics,
  getInvitesAnalytics,
} from '../../services/tvetgrid/analytics';
import { formatDate } from '../../utils/tvetgrid/formatDate';
import { ANALYTICS_TABS } from '../../utils/tvetgrid/constants';

const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global' },
  { value: 'course', label: 'By course' },
  { value: 'paper', label: 'By paper' },
];

function defaultRange(days = 30) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function Analytics() {
  const toast = useToast();

  const [tab, setTab] = useState('attempts');
  const [range, setRange] = useState(defaultRange(30));
  const [scope, setScope] = useState('global');
  const [loading, setLoading] = useState(true);

  const [attempts, setAttempts] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [invites, setInvites] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'attempts') {
        const res = await getAttemptsAnalytics({
          from: range.from,
          to: range.to,
          scope,
        });
        setAttempts(res?.data || res);
      } else if (tab === 'mastery') {
        const res = await getMasteryAnalytics({
          from: range.from,
          to: range.to,
        });
        setMastery(res?.data || res);
      } else if (tab === 'attendance') {
        const res = await getAttendanceAnalytics({
          from: range.from,
          to: range.to,
        });
        setAttendance(res?.data || res);
      } else if (tab === 'invites') {
        const res = await getInvitesAnalytics();
        setInvites(res?.data || res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, range.from, range.to, scope]);

  const totalAttempts = (attempts?.items || []).reduce(
    (sum, x) => sum + (x.attempts || x.count || 0),
    0
  );

  const totalMastery = (mastery?.items || []).slice(-1)[0]?.mastery || {
    red: 0,
    amber: 0,
    green: 0,
  };
  const masteryTotal =
    (totalMastery.red || 0) + (totalMastery.amber || 0) + (totalMastery.green || 0);

  const totalAttendance = (attendance?.items || []).reduce(
    (acc, x) => {
      acc.scheduled += x.meetingsScheduled || 0;
      acc.held += x.meetingsHeld || 0;
      acc.invites += x.invitesSent || 0;
      acc.attended += x.invitesAttended || 0;
      return acc;
    },
    { scheduled: 0, held: 0, invites: 0, attended: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Analytics
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform activity and outcomes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 border-b border-[var(--border-color)] overflow-x-auto">
            {ANALYTICS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  tab === t.key
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab !== 'invites' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <Input
                label="From"
                type="date"
                value={range.from}
                onChange={(e) => setRange({ ...range, from: e.target.value })}
              />
              <Input
                label="To"
                type="date"
                value={range.to}
                onChange={(e) => setRange({ ...range, to: e.target.value })}
              />
              {tab === 'attempts' && (
                <Select
                  label="Scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  options={SCOPE_OPTIONS}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {tab === 'attempts' && attempts && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Attempts in range
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {totalAttempts.toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Last 30 days
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(attempts.last30Days || 0).toLocaleString()}
                  </p>
                </Card>
              </div>
              <Card title="Daily attempts" padding={false}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Date</th>
                        <th className="px-4 py-2 text-right font-medium">Attempts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {(attempts.items || []).map((x, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-[var(--text-primary)]">
                            {formatDate(x.date)}
                          </td>
                          <td className="px-4 py-2 text-right text-[var(--text-primary)]">
                            {(x.attempts || x.count || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {tab === 'mastery' && mastery && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Red
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(totalMastery.red || 0).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Amber
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(totalMastery.amber || 0).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
                    Green
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(totalMastery.green || 0).toLocaleString()}
                  </p>
                </Card>
              </div>
              {masteryTotal > 0 && (
                <Card title="Latest distribution">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500"
                      style={{ width: `${(totalMastery.red / masteryTotal) * 100}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${(totalMastery.amber / masteryTotal) * 100}%` }}
                    />
                    <div
                      className="bg-green-500"
                      style={{ width: `${(totalMastery.green / masteryTotal) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-[var(--text-muted)] mt-2">
                    <span>Red {Math.round((totalMastery.red / masteryTotal) * 100)}%</span>
                    <span>Amber {Math.round((totalMastery.amber / masteryTotal) * 100)}%</span>
                    <span>Green {Math.round((totalMastery.green / masteryTotal) * 100)}%</span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {tab === 'attendance' && attendance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Scheduled</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {totalAttendance.scheduled}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Held</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {totalAttendance.held}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Invites</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {totalAttendance.invites}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Attended</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {totalAttendance.attended}
                  </p>
                </Card>
              </div>
              <Card title="Daily attendance" padding={false}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Date</th>
                        <th className="px-4 py-2 text-right font-medium">Scheduled</th>
                        <th className="px-4 py-2 text-right font-medium">Held</th>
                        <th className="px-4 py-2 text-right font-medium">Invites</th>
                        <th className="px-4 py-2 text-right font-medium">Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {(attendance.items || []).map((x, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-[var(--text-primary)]">
                            {formatDate(x.date)}
                          </td>
                          <td className="px-4 py-2 text-right text-[var(--text-primary)]">
                            {x.meetingsScheduled || 0}
                          </td>
                          <td className="px-4 py-2 text-right text-[var(--text-primary)]">
                            {x.meetingsHeld || 0}
                          </td>
                          <td className="px-4 py-2 text-right text-[var(--text-primary)]">
                            {x.invitesSent || 0}
                          </td>
                          <td className="px-4 py-2 text-right text-[var(--text-primary)]">
                            {x.invitesAttended || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {tab === 'invites' && invites && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Total invites</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(invites.total || 0).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Attended</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {(invites.attended || 0).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-[var(--text-secondary)]">Rate</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                    {invites.total > 0
                      ? Math.round((invites.attended / invites.total) * 100)
                      : 0}
                    %
                  </p>
                </Card>
              </div>
              <Card title="By channel">
                <div className="space-y-2">
                  {(invites.byChannel || []).map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <Badge variant="info">{c._id || c.channel}</Badge>
                      <span className="text-[var(--text-primary)] font-medium">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}