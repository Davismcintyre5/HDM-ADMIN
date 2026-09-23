import { useEffect, useState } from 'react';
import { HiSparkles, HiLightningBolt, HiClock } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import StatCard from '../../components/smartpos/ui/StatCard';
import Pagination from '../../components/smartpos/ui/Pagination';
import Spinner from '../../components/smartpos/ui/Spinner';
import { getAiUsage, getAiUsageSummary } from '../../services/smartpos/aiUsage';
import { relativeTime } from '../../utils/smartpos/formatDate';

export default function AiUsage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        getAiUsage({ page: p, limit: 20 }),
        p === 1 ? getAiUsageSummary() : Promise.resolve(null),
      ]);
      const data = list?.data || list;
      setLogs(data?.data || data || []);
      setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
      if (sum) setSummary(sum?.data || sum);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="info">{row.type}</Badge>,
    },
    {
      key: 'tenantId',
      label: 'Client',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {row.tenantId ? String(row.tenantId).slice(-8) : 'public'}
        </span>
      ),
    },
    {
      key: 'tokensUsed',
      label: 'Tokens',
      align: 'right',
      render: (row) => (
        <span className="text-[var(--text-primary)]">
          {(row.tokensUsed || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'latencyMs',
      label: 'Latency',
      align: 'right',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {row.latencyMs ? `${(row.latencyMs / 1000).toFixed(2)}s` : '—'}
        </span>
      ),
    },
    {
      key: 'success',
      label: 'Result',
      render: (row) => (
        <Badge variant={row.success ? 'success' : 'danger'} dot>
          {row.success ? 'OK' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {relativeTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI usage</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          HDM AI calls across all clients
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Calls (30d)"
            value={(summary.totals?.calls ?? 0).toLocaleString()}
            icon={HiSparkles}
            color="text-purple-500"
          />
          <StatCard
            label="Tokens (30d)"
            value={(summary.totals?.tokens ?? 0).toLocaleString()}
            icon={HiLightningBolt}
            color="text-amber-500"
          />
          <StatCard
            label="Avg latency"
            value={`${((summary.totals?.avgLatencyMs ?? 0) / 1000).toFixed(2)}s`}
            icon={HiClock}
            color="text-blue-500"
          />
        </div>
      )}

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Recent calls</h2>
        </div>
        <div className="p-4">
          {loading && !logs.length ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={logs}
                loading={loading}
                rowKey={(r) => r._id || r.id}
                emptyMessage="No AI calls yet"
              />
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}