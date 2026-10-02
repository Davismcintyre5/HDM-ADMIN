import { useEffect, useState } from 'react';
import {
  getInvoices,
  getInvoice,
  confirmInvoice,
  rejectInvoice,
} from '../../services/bridge/invoices';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import SearchBar from '../../components/bridge/ui/SearchBar';
import Pagination from '../../components/bridge/ui/Pagination';
import Spinner from '../../components/bridge/ui/Spinner';
import { formatDate } from '../../utils/bridge/formatDate';
import {
  HiEye,
  HiCheck,
  HiX,
  HiClipboardCopy,
} from 'react-icons/hi';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'subscription', label: 'Upgrade' },
  { value: 'renewal', label: 'Renewal' },
];

function statusVariant(status) {
  if (status === 'paid') return 'success';
  if (status === 'sent') return 'warning';
  if (status === 'failed' || status === 'expired') return 'danger';
  return 'default';
}

function money(amount, currency = 'USD') {
  const n = Number(amount || 0);
  const symbols = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';
  return symbol + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function typeLabel(type) {
  if (type === 'renewal') return 'Renewal';
  if (type === 'upgrade') return 'Upgrade';
  if (type === 'subscription') return 'Upgrade';
  return 'Upgrade';
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const [viewModal, setViewModal] = useState({ open: false, invoice: null, loading: false });
  const [confirmModal, setConfirmModal] = useState({ open: false, invoice: null, reference: '', loading: false });
  const [rejectModal, setRejectModal] = useState({ open: false, invoice: null, reason: '', loading: false });

  const fetchInvoices = () => {
    setLoading(true);
    getInvoices({ page, limit: 20, search, status, type })
      .then((res) => {
        setInvoices(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, [page, search, status, type]);

  const handleView = async (id) => {
    setViewModal({ open: true, invoice: null, loading: true });
    try {
      const res = await getInvoice(id);
      setViewModal({ open: true, invoice: res.invoice || res.data || res, loading: false });
    } catch (err) {
      alert(err.message);
      setViewModal({ open: false, invoice: null, loading: false });
    }
  };

  const openConfirm = (invoice) => {
    setConfirmModal({ open: true, invoice, reference: '', loading: false });
  };

  const openReject = (invoice) => {
    setRejectModal({ open: true, invoice, reason: '', loading: false });
  };

  const handleConfirm = async () => {
    if (!confirmModal.reference.trim()) return;
    setConfirmModal((s) => ({ ...s, loading: true }));
    try {
      await confirmInvoice(confirmModal.invoice._id || confirmModal.invoice.id, {
        reference: confirmModal.reference.trim(),
      });
      setConfirmModal({ open: false, invoice: null, reference: '', loading: false });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
      setConfirmModal((s) => ({ ...s, loading: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) return;
    setRejectModal((s) => ({ ...s, loading: true }));
    try {
      await rejectInvoice(rejectModal.invoice._id || rejectModal.invoice.id, {
        reason: rejectModal.reason.trim(),
      });
      setRejectModal({ open: false, invoice: null, reason: '', loading: false });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
      setRejectModal((s) => ({ ...s, loading: false }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleView(row._id || row.id)}
            className="text-indigo-600 hover:underline font-mono text-xs text-left"
          >
            {row.invoiceNumber}
          </button>
          <Badge variant={row.type === 'renewal' ? 'info' : 'default'}>
            {typeLabel(row.type)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div className="text-sm">
          <p className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
            {row.customerSnapshot?.name || row.userId?.firstName || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">
            {row.customerSnapshot?.email || row.userId?.email || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => <Badge variant="indigo">{row.planName || '—'}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {money(row.total, row.currency)}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] capitalize">
          {row.paymentMethod || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'dueDate',
      label: 'Due',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">{formatDate(row.dueDate)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => handleView(row._id || row.id)}>
            <HiEye className="w-4 h-4" />
          </Button>
          {row.status === 'sent' && (
            <>
              <Button size="sm" variant="success" onClick={() => openConfirm(row)}>
                <HiCheck className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => openReject(row)}>
                <HiX className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const vm = viewModal;
  const cm = confirmModal;
  const rm = rejectModal;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Invoices</h1>
          <p className="text-xs text-[var(--text-muted)]">{pagination.total || invoices.length} invoices</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  status === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setType(f.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  type === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." />
        </div>
      </div>

      <Card>
        <Table columns={columns} data={invoices} loading={loading} emptyMessage="No invoices found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal
        open={vm.open}
        onClose={() => setViewModal({ open: false, invoice: null, loading: false })}
        title="Invoice Details"
        size="lg"
      >
        {vm.loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : vm.invoice ? (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)] font-mono">{vm.invoice.invoiceNumber}</h3>
                  <Badge variant={vm.invoice.type === 'renewal' ? 'info' : 'default'}>
                    {typeLabel(vm.invoice.type)}
                  </Badge>
                </div>
                <Badge variant={statusVariant(vm.invoice.status)}>{vm.invoice.status}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><span className="text-[var(--text-primary)]">{vm.invoice.planName}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">{money(vm.invoice.total, vm.invoice.currency)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Method:</span><span className="text-[var(--text-primary)] capitalize">{vm.invoice.paymentMethod || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reference:</span><span className="text-[var(--text-primary)] font-mono text-xs">{vm.invoice.paymentRef || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Issued:</span><span className="text-[var(--text-primary)]">{formatDate(vm.invoice.issuedAt, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Due:</span><span className="text-[var(--text-primary)]">{formatDate(vm.invoice.dueDate, 'full')}</span></div>
              {vm.invoice.paidAt && (
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Paid:</span><span className="text-[var(--text-primary)]">{formatDate(vm.invoice.paidAt, 'full')}</span></div>
              )}
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Customer</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{vm.invoice.customerSnapshot?.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{vm.invoice.customerSnapshot?.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{vm.invoice.customerSnapshot?.phone || '—'}</span></div>
              </div>
            </div>

            {vm.invoice.items?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Items</h3>
                <div className="space-y-2">
                  {vm.invoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="text-[var(--text-primary)]">{item.name}</p>
                        {item.description && <p className="text-xs text-[var(--text-muted)]">{item.description}</p>}
                      </div>
                      <span className="text-[var(--text-primary)]">{money(item.subtotal, vm.invoice.currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border-color)] mt-3 pt-3 flex justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">Total</span>
                  <span className="font-semibold text-[var(--text-primary)]">{money(vm.invoice.total, vm.invoice.currency)}</span>
                </div>
              </div>
            )}

            {vm.invoice.paymentInstructions?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Payment Instructions</h3>
                <div className="space-y-3">
                  {vm.invoice.paymentInstructions.map((m, i) => (
                    <div key={i} className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                      <p className="font-medium text-[var(--text-primary)] mb-1">{m.title || m.code}</p>
                      {m.description && <p className="text-xs text-[var(--text-muted)] mb-2">{m.description}</p>}
                      {m.steps?.length > 0 && (
                        <ol className="list-decimal pl-4 text-xs text-[var(--text-secondary)] space-y-0.5">
                          {m.steps.map((s, j) => <li key={j}>{s}</li>)}
                        </ol>
                      )}
                      {m.recipient && Object.keys(m.recipient).length > 0 && (
                        <div className="mt-2 space-y-1 text-xs">
                          {Object.entries(m.recipient).filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="text-[var(--text-muted)] capitalize">{k}:</span>
                              <span className="text-[var(--text-primary)] font-mono">{String(v)}</span>
                              <button onClick={() => copyToClipboard(String(v))} className="text-[var(--text-muted)] hover:text-indigo-600">
                                <HiClipboardCopy className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vm.invoice.notes && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Notes</h3>
                <p className="text-[var(--text-secondary)] text-xs">{vm.invoice.notes}</p>
              </div>
            )}

            {vm.invoice.status === 'sent' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <Button variant="danger" onClick={() => { setViewModal({ open: false, invoice: null, loading: false }); openReject(vm.invoice); }}>
                  <HiX className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button variant="success" onClick={() => { setViewModal({ open: false, invoice: null, loading: false }); openConfirm(vm.invoice); }}>
                  <HiCheck className="w-4 h-4 mr-1" /> Confirm Payment
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Invoice not found.</p>
        )}
      </Modal>

      <Modal
        open={cm.open}
        onClose={() => setConfirmModal({ open: false, invoice: null, reference: '', loading: false })}
        title="Confirm Payment"
        size="sm"
      >
        {cm.invoice && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Invoice:</span><span className="text-[var(--text-primary)] font-mono text-xs">{cm.invoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">{money(cm.invoice.total, cm.invoice.currency)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Customer:</span><span className="text-[var(--text-primary)] truncate max-w-[180px]">{cm.invoice.customerSnapshot?.email}</span></div>
            </div>

            <Input
              label="Payment reference"
              hint="M-Pesa receipt number, bank reference, or transaction ID"
              value={cm.reference}
              onChange={(e) => setConfirmModal((s) => ({ ...s, reference: e.target.value }))}
              placeholder="e.g. SJK4XY2P9L"
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmModal({ open: false, invoice: null, reference: '', loading: false })}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirm} loading={cm.loading} disabled={!cm.reference.trim()}>
                Confirm Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={rm.open}
        onClose={() => setRejectModal({ open: false, invoice: null, reason: '', loading: false })}
        title="Reject Invoice"
        size="sm"
      >
        {rm.invoice && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Invoice:</span><span className="text-[var(--text-primary)] font-mono text-xs">{rm.invoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">{money(rm.invoice.total, rm.invoice.currency)}</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason</label>
              <textarea
                value={rm.reason}
                onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))}
                rows={3}
                placeholder="Why is this invoice being rejected?"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejectModal({ open: false, invoice: null, reason: '', loading: false })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject} loading={rm.loading} disabled={!rm.reason.trim()}>
                Reject Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}