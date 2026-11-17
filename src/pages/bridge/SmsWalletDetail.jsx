import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSmsWalletByOrg, grantSmsCredits } from '../../services/bridge/sms';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Spinner from '../../components/bridge/ui/Spinner';
import PageHeader from '../../components/bridge/ui/PageHeader';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiArrowLeft, HiPlus, HiRefresh } from 'react-icons/hi';

function formatKes(n) {
  if (n === undefined || n === null) return '—';
  return `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_VARIANT = {
  sent: 'success',
  delivered: 'success',
  queued: 'warning',
  failed: 'danger',
};

export default function SmsWalletDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grantModal, setGrantModal] = useState({
    open: false, loading: false,
    form: { amountKes: '', reason: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSmsWalletByOrg(orgId);
      setData(res);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const submitGrant = async () => {
    const amt = Number(grantModal.form.amountKes);
    if (!amt || amt <= 0) return alert('Enter a positive amount');
    if (!grantModal.form.reason.trim()) return alert('Reason is required');

    setGrantModal((s) => ({ ...s, loading: true }));
    try {
      const res = await grantSmsCredits(orgId, {
        amountKes: amt,
        reason: grantModal.form.reason.trim(),
      });
      alert(`Granted KSh ${amt.toFixed(2)}. New balance: KSh ${Number(res.balance).toFixed(2)}`);
      setGrantModal({ open: false, loading: false, form: { amountKes: '', reason: '' } });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setGrantModal((s) => ({ ...s, loading: false }));
    }
  };

  if (loading && !data) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  if (!data || !data.wallet) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Wallet not found.</p>
        <Button onClick={() => navigate('/sms/wallets')} className="mt-4">
          <HiArrowLeft className="w-4 h-4 mr-1" /> Back to wallets
        </Button>
      </div>
    );
  }

  const { wallet, recentLogs = [] } = data;
  const org = wallet.organizationId || {};

  const logColumns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'to',
      label: 'To',
      render: (row) => <span className="font-mono text-xs">{row.to}</span>,
    },
    {
      key: 'content',
      label: 'Message',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] line-clamp-2" title={row.content}>
          {row.content}
        </span>
      ),
    },
    {
      key: 'senderId',
      label: 'Sender',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {row.senderId || '(AT default)'}
        </span>
      ),
    },
    {
      key: 'costKes',
      label: 'Cost',
      render: (row) => (
        <span className="text-xs font-mono">{formatKes(row.costKes)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={STATUS_VARIANT[row.status] || 'default'}>{row.status}</Badge>
          {row.statusCode && (
            <span className="text-xs text-[var(--text-muted)]">code {row.statusCode}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/sms/wallets')}>
          <HiArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button variant="secondary" onClick={load} loading={loading}>
          <HiRefresh className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <PageHeader
        title={org.name || 'SMS Wallet'}
        description={org.email || 'Organization SMS balance'}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-[var(--text-muted)]">Current balance</p>
            <Button size="sm" onClick={() => setGrantModal((s) => ({ ...s, open: true }))}>
              <HiPlus className="w-4 h-4 mr-1" /> Grant
            </Button>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] font-mono">
            {formatKes(wallet.balance)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{wallet.currency || 'KES'}</p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--text-muted)] mb-1">Lifetime topped up</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">
            {formatKes(wallet.lifetimeToppedUp)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Last: {wallet.lastTopUpAt ? formatDate(wallet.lastTopUpAt) : 'Never'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-[var(--text-muted)] mb-1">Lifetime spent</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">
            {formatKes(wallet.lifetimeSpent)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {recentLogs.length} recent sends
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">
          Recent SMS activity (last 20)
        </h3>
        <Table
          columns={logColumns}
          data={recentLogs}
          emptyMessage="No SMS activity yet."
        />
      </Card>

      <Modal
        open={grantModal.open}
        onClose={() => setGrantModal((s) => ({ ...s, open: false }))}
        title="Grant SMS credits"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
            <p className="font-medium text-[var(--text-primary)]">{org.name || '—'}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Current balance: {formatKes(wallet.balance)}
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
              placeholder="e.g. Refund for failed send, promo credit"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

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
      </Modal>
    </div>
  );
}