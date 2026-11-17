import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSmsWallets, getSmsConfig, grantSmsCredits } from '../../services/bridge/sms';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Spinner from '../../components/bridge/ui/Spinner';
import PageHeader from '../../components/bridge/ui/PageHeader';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiSearch, HiRefresh, HiPlus, HiExternalLink } from 'react-icons/hi';

function formatKes(n) {
  if (n === undefined || n === null) return '—';
  return `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SmsWallets() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [grantModal, setGrantModal] = useState({
    open: false, wallet: null, loading: false,
    form: { amountKes: '', reason: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (lowOnly) params.lowBalance = 'true';
      const [walletRes, configRes] = await Promise.all([
        getSmsWallets(params),
        config ? Promise.resolve({ config }) : getSmsConfig(),
      ]);
      setData(walletRes);
      if (configRes?.config) setConfig(configRes.config);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, lowOnly, config]);

  useEffect(() => { load(); }, [load]);

  const lowThreshold = config?.lowBalanceKes ?? 10;

  const openGrant = (wallet) => setGrantModal({
    open: true, wallet, loading: false,
    form: { amountKes: '', reason: '' },
  });

  const submitGrant = async () => {
    const amt = Number(grantModal.form.amountKes);
    if (!amt || amt <= 0) return alert('Enter a positive amount');
    if (!grantModal.form.reason.trim()) return alert('Reason is required');

    setGrantModal((s) => ({ ...s, loading: true }));
    try {
      const orgId = grantModal.wallet.organizationId?._id || grantModal.wallet.organizationId;
      const res = await grantSmsCredits(orgId, {
        amountKes: amt,
        reason: grantModal.form.reason.trim(),
      });
      alert(`Granted KSh ${amt.toFixed(2)}. New balance: KSh ${Number(res.balance).toFixed(2)}`);
      setGrantModal((s) => ({ ...s, open: false, loading: false }));
      await load();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setGrantModal((s) => ({ ...s, loading: false }));
    }
  };

  const columns = [
    {
      key: 'organization',
      label: 'Organization',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.organizationId?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {row.organizationId?.email || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (row) => {
        const isLow = Number(row.balance) < lowThreshold;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono font-semibold ${isLow ? 'text-yellow-600' : 'text-[var(--text-primary)]'}`}>
              {formatKes(row.balance)}
            </span>
            {isLow && <Badge variant="warning">Low</Badge>}
          </div>
        );
      },
    },
    {
      key: 'lifetime',
      label: 'Lifetime',
      render: (row) => (
        <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
          <p>In: {formatKes(row.lifetimeToppedUp)}</p>
          <p>Out: {formatKes(row.lifetimeSpent)}</p>
        </div>
      ),
    },
    {
      key: 'lastTopUp',
      label: 'Last top-up',
      render: (row) => (
        <div className="text-xs text-[var(--text-secondary)]">
          {row.lastTopUpAt ? (
            <>
              <p>{formatDate(row.lastTopUpAt)}</p>
              <p className="text-[var(--text-muted)]">{formatKes(row.lastTopUpAmount)}</p>
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const orgId = row.organizationId?._id || row.organizationId;
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              title="View details"
              onClick={() => navigate(`/sms/wallets/${orgId}`)}
            >
              <HiExternalLink className="w-4 h-4" />
            </Button>
            <Button size="sm" title="Grant credits" onClick={() => openGrant(row)}>
              <HiPlus className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const pagination = data.pagination || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Wallets"
        description="Customer SMS balances and credit grants"
      />

      {config && (
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Status</p>
              <Badge variant={config.enabled ? 'success' : 'warning'}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Rate</p>
              <p className="font-mono text-[var(--text-primary)]">{formatKes(config.rateKes)} / SMS</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">AT cost</p>
              <p className="font-mono text-[var(--text-primary)]">{formatKes(config.atCostKes)} / SMS</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Margin</p>
              <p className="font-mono text-green-600 font-semibold">{formatKes(config.marginPerSmsKes)} / SMS</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <HiSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by organization name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => { setLowOnly(e.target.checked); setPage(1); }}
              className="rounded"
            />
            <span>Low balance only (&lt; {formatKes(lowThreshold)})</span>
          </label>
          <Button variant="secondary" onClick={load} loading={loading}>
            <HiRefresh className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <Table
            columns={columns}
            data={data.data || []}
            emptyMessage="No SMS wallets yet. Wallets are created automatically for each organization."
          />
        )}

        {pagination.total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-[var(--text-muted)]">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={grantModal.open}
        onClose={() => setGrantModal((s) => ({ ...s, open: false }))}
        title="Grant SMS credits"
        size="md"
      >
        {grantModal.wallet && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <p className="font-medium text-[var(--text-primary)]">
                {grantModal.wallet.organizationId?.name || '—'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Current balance: {formatKes(grantModal.wallet.balance)}
              </p>
            </div>

            <Input
              label="Amount (KES)"
              type="number"
              step="0.01"
              min="0.01"
              value={grantModal.form.amountKes}
              onChange={(e) => setGrantModal((s) => ({ ...s, form: { ...s.form, amountKes: e.target.value } }))}
              placeholder="e.g. 500"
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Reason (required — appears in audit log)
              </label>
              <textarea
                value={grantModal.form.reason}
                onChange={(e) => setGrantModal((s) => ({ ...s, form: { ...s.form, reason: e.target.value } }))}
                rows={2}
                placeholder="e.g. Refund for failed send, promo credit, goodwill"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              This directly credits the wallet. A <span className="font-mono">lifetimeToppedUp</span> entry is added.
              No <span className="font-mono">Transaction</span> record is created — grants are operational, not billed.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setGrantModal((s) => ({ ...s, open: false }))}>
                Cancel
              </Button>
              <Button
                onClick={submitGrant}
                loading={grantModal.loading}
                disabled={!grantModal.form.amountKes || !grantModal.form.reason.trim()}
              >
                Grant credits
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}