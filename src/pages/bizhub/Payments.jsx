import { useState, useEffect, useCallback } from 'react';
import {
  getPayments,
  getPaymentStats,
  createManualPayment,
  refundPayment,
} from '../../services/bizhub/payments';
import { getPaymentMethods, updatePaymentMethods } from '../../services/bizhub/paymentMethods';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import SearchBar from '../../components/bizhub/ui/SearchBar';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Input from '../../components/bizhub/ui/Input';
import Toggle from '../../components/bizhub/ui/Toggle';
import Modal from '../../components/bizhub/ui/Modal';
import Pagination from '../../components/bizhub/ui/Pagination';
import Spinner from '../../components/bizhub/ui/Spinner';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiPlus, HiCash, HiCreditCard } from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'cancelled', label: 'Cancelled' },
];

const TABS = [
  { key: 'transactions', label: 'Transactions', icon: HiCash },
  { key: 'methods', label: 'Payment Methods', icon: HiCreditCard },
];

const unwrapList = (res) => {
  const payload = res?.data?.data || res?.data || res;
  return {
    list: Array.isArray(payload) ? payload : payload?.payments || [],
    pagination: res?.pagination || res?.data?.pagination || { page: 1, pages: 1 },
  };
};

const unwrapData = (res) => res?.data?.data || res?.data || res;

const paymentStatusVariant = {
  active: 'success',
  success: 'success',
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'warning',
  cancelled: 'danger',
  superseded: 'default',
};

export default function Payments() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [methods, setMethods] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [manualModal, setManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ tenantId: '', amount: 0, description: '' });
  const [refundModal, setRefundModal] = useState({ open: false, id: null });
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [savingMethods, setSavingMethods] = useState(false);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    getPayments(params)
      .then((res) => {
        const { list, pagination: pg } = unwrapList(res);
        setPayments(list);
        setPagination(pg);
      })
      .catch((err) => console.error('Payments fetch:', err))
      .finally(() => setLoading(false));
  }, [page, filter, search]);

  const fetchStats = useCallback(() => {
    getPaymentStats()
      .then((res) => setStats(unwrapData(res)))
      .catch(() => {});
  }, []);

  const fetchMethods = useCallback(() => {
    setMethodsLoading(true);
    getPaymentMethods()
      .then((res) => setMethods(unwrapData(res) || {}))
      .catch((err) => console.error('Methods fetch:', err))
      .finally(() => setMethodsLoading(false));
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  useEffect(() => {
    if (activeTab === 'methods') fetchMethods();
  }, [activeTab, fetchMethods]);

  const handleManual = async () => {
    if (!manualForm.tenantId || !manualForm.amount) {
      return alert('Tenant ID and amount are required');
    }
    setActionLoading(true);
    try {
      await createManualPayment(manualForm);
      setManualModal(false);
      setManualForm({ tenantId: '', amount: 0, description: '' });
      fetchPayments();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      return alert('Please provide a reason');
    }
    setActionLoading(true);
    try {
      await refundPayment(refundModal.id, refundReason);
      setRefundModal({ open: false, id: null });
      setRefundReason('');
      fetchPayments();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleSaveMethods = async () => {
    setSavingMethods(true);
    try {
      await updatePaymentMethods(methods);
      alert('Payment methods saved!');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setSavingMethods(false);
  };

  const getVal = (key, fallback = '') => methods?.[key] ?? fallback;
  const isTrue = (key) => getVal(key) === true || getVal(key) === 'true';

  const columns = [
    {
      key: 'tenantId',
      label: 'Tenant',
      render: (row) => {
        if (typeof row.tenantId === 'object' && row.tenantId) {
          return row.tenantId.businessName || row.tenantId.name || '—';
        }
        return row.tenant?.businessName || row.tenantId || '—';
      },
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => row.invoice?.invoiceNumber || row.invoiceNumber || '—',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-medium">
          KES {Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <Badge variant="info">{(row.method || 'manual').replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={paymentStatusVariant[row.status] || 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'active' || row.status === 'success' ? (
          <Button
            size="sm"
            variant="warning"
            onClick={() => setRefundModal({ open: true, id: row._id })}
          >
            Refund
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-xs text-[var(--text-muted)]">Total Revenue</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              KES {Number(stats.totalRevenue || 0).toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[var(--text-muted)]">This Month</p>
            <p className="text-2xl font-bold text-green-600">
              KES {Number(stats.monthlyRevenue || 0).toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[var(--text-muted)]">Payments</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.totalPayments || 0}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[var(--text-muted)]">Active Subs</p>
            <p className="text-2xl font-bold text-teal-600">
              {stats.activeSubscriptions || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-teal-600 text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={() => setManualModal(true)}>
                <HiPlus className="w-4 h-4 mr-1" /> Manual Payment
              </Button>
              <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." />
            </div>
          </div>

          <Card>
            <Table
              columns={columns}
              data={payments}
              loading={loading}
              emptyMessage="No payments found."
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages || pagination.totalPages || 1}
              onPageChange={setPage}
            />
          </Card>

          <Modal
            open={manualModal}
            onClose={() => setManualModal(false)}
            title="Record Manual Payment"
            size="sm"
          >
            <div className="space-y-4">
              <Input
                label="Tenant ID *"
                value={manualForm.tenantId}
                onChange={(e) => setManualForm({ ...manualForm, tenantId: e.target.value })}
                placeholder="Mongo ObjectId"
              />
              <Input
                label="Amount (KES) *"
                type="number"
                value={manualForm.amount}
                onChange={(e) => setManualForm({ ...manualForm, amount: +e.target.value })}
              />
              <Input
                label="Description"
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setManualModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManual} loading={actionLoading}>
                  Record
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            open={refundModal.open}
            onClose={() => {
              setRefundModal({ open: false, id: null });
              setRefundReason('');
            }}
            title="Refund Payment"
            size="sm"
          >
            <Input
              label="Reason *"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund"
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setRefundModal({ open: false, id: null });
                  setRefundReason('');
                }}
              >
                Cancel
              </Button>
              <Button variant="warning" onClick={handleRefund} loading={actionLoading}>
                Refund
              </Button>
            </div>
          </Modal>
        </>
      )}

      {activeTab === 'methods' &&
        (methodsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : methods ? (
          <div className="space-y-6 max-w-2xl">
            <Card>
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Auto Payments</h2>
              <div className="space-y-4">
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <Toggle
                    label="📱 M-Pesa STK Push"
                    checked={isTrue('momoStkActive')}
                    onChange={(v) => setMethods((prev) => ({ ...prev, momoStkActive: v }))}
                    description="Instant popup payment on customer's phone"
                  />
                </div>
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <Toggle
                    label="💳 Stripe"
                    checked={isTrue('stripeActive')}
                    onChange={(v) => setMethods((prev) => ({ ...prev, stripeActive: v }))}
                    description="Accept credit/debit card payments"
                  />
                  {isTrue('stripeActive') && (
                    <div className="mt-3">
                      <Input
                        label="Stripe Public Key"
                        value={getVal('stripePublicKey')}
                        onChange={(e) =>
                          setMethods((prev) => ({ ...prev, stripePublicKey: e.target.value }))
                        }
                        placeholder="pk_test_xxx"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Manual Payments</h2>
              <div className="space-y-4">
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <Toggle
                    label="📲 Send Money"
                    checked={isTrue('momoSendActive')}
                    onChange={(v) => setMethods((prev) => ({ ...prev, momoSendActive: v }))}
                    description="Customer sends money to your number"
                  />
                  {isTrue('momoSendActive') && (
                    <div className="mt-3">
                      <Input
                        label="Phone Number"
                        value={getVal('momoSendNumber')}
                        onChange={(e) =>
                          setMethods((prev) => ({ ...prev, momoSendNumber: e.target.value }))
                        }
                        placeholder="254712345678"
                      />
                    </div>
                  )}
                </div>

                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <Toggle
                    label="🛒 Till Number"
                    checked={isTrue('momoTillActive')}
                    onChange={(v) => setMethods((prev) => ({ ...prev, momoTillActive: v }))}
                    description="Customer pays via Till number"
                  />
                  {isTrue('momoTillActive') && (
                    <div className="mt-3">
                      <Input
                        label="Till Number"
                        value={getVal('momoTillNumber')}
                        onChange={(e) =>
                          setMethods((prev) => ({ ...prev, momoTillNumber: e.target.value }))
                        }
                        placeholder="123456"
                      />
                    </div>
                  )}
                </div>

                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <Toggle
                    label="🏦 Paybill"
                    checked={isTrue('momoPaybillActive')}
                    onChange={(v) => setMethods((prev) => ({ ...prev, momoPaybillActive: v }))}
                    description="Customer pays via Paybill number"
                  />
                  {isTrue('momoPaybillActive') && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <Input
                        label="Business Number"
                        value={getVal('momoPaybillBusiness')}
                        onChange={(e) =>
                          setMethods((prev) => ({ ...prev, momoPaybillBusiness: e.target.value }))
                        }
                        placeholder="247247"
                      />
                      <Input
                        label="Account Number"
                        value={getVal('momoPaybillAccount')}
                        onChange={(e) =>
                          setMethods((prev) => ({ ...prev, momoPaybillAccount: e.target.value }))
                        }
                        placeholder="BizHub"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Proof of Payment</h2>
              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <Toggle
                  label="📎 Require Screenshot"
                  checked={isTrue('requireProof')}
                  onChange={(v) => setMethods((prev) => ({ ...prev, requireProof: v }))}
                  description="Applies to all manual payment methods"
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveMethods} loading={savingMethods} size="lg">
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">
              Failed to load payment methods.
            </p>
          </Card>
        ))}
    </div>
  );
}