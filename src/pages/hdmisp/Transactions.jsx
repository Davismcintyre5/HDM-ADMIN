import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiEye, HiRefresh, HiCash } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Table from '../../components/hdmisp/ui/Table';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Pagination from '../../components/hdmisp/ui/Pagination';
import { useToast } from '../../context/hdmisp/ToastContext';
import { getTransactions } from '../../services/hdmisp/billing';
import { getProviders } from '../../services/hdmisp/providers';
import { formatDateTime } from '../../utils/hdmisp/formatDate';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import {
  TRANSACTION_STATUS_LIST,
  statusVariant,
  statusLabel,
  PAGE_LIMIT,
} from '../../utils/hdmisp/constants';

export default function Transactions() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [providerId, setProviderId] = useState('');

  const [providers, setProviders] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        phone: phone || undefined,
        from: from || undefined,
        to: to || undefined,
        providerId: providerId || undefined,
      });
      setItems(res.data || []);
      setMeta({
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        total: res.meta?.total || 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, status, phone, from, to, providerId, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getProviders({ limit: 200 }).then((r) => setProviders(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPhone(phoneInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [phoneInput]);

  const columns = [
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-sm font-mono text-[var(--text-primary)]">{row.phone || '—'}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.amount, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'mpesaReceiptNumber',
      label: 'Receipt',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {row.mpesaReceiptNumber || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => { e.stopPropagation(); navigate(`/hdmisp/transactions/${row._id}`); }}
        >
          <HiEye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} transaction{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => { setStatus(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!status ? 'bg-cyan-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
              type="button"
            >
              All
            </button>
            {TRANSACTION_STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-cyan-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
                type="button"
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input label="Phone" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="2547…" />
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Provider</label>
              <select
                value={providerId}
                onChange={(e) => { setProviderId(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
              >
                <option value="">All providers</option>
                {providers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <Input label="From" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            <Input label="To" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="p-4">
          {loading && !items.length ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiCash className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No transactions match your filters</p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={items} rowKey={(r) => r._id} onRowClick={(r) => navigate(`/hdmisp/transactions/${r._id}`)} />
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}