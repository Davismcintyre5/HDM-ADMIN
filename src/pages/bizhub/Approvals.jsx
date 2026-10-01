import { useState, useEffect, useCallback } from 'react';
import {
  getNewApprovals,
  getRenewals,
  getUpgrades,
  getApprovalStats,
  approveApproval,
  rejectApproval,
  confirmPayment,
  deleteApproval,
  bulkApprove,
} from '../../services/bizhub/approvals';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Input from '../../components/bizhub/ui/Input';
import Modal from '../../components/bizhub/ui/Modal';
import Pagination from '../../components/bizhub/ui/Pagination';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import { formatDate } from '../../utils/bizhub/formatDate';
import {
  HiEye,
  HiCheck,
  HiX,
  HiUserAdd,
  HiRefresh,
  HiArrowUp,
  HiTrash,
  HiCash,
} from 'react-icons/hi';

const MODULE_ICONS = {
  pharmacy: '💊', restaurant: '🍽️', apartment: '🏢', electronics: '🔌', cyber: '💻',
  pharmasys: '💊', restomanagerke: '🍽️', myapartment: '🏢', electrostore: '🔌', digitalmanager: '💻',
};

const MODULE_NAMES = {
  pharmacy: 'PharmaSys',
  restaurant: 'RestoManagerKE',
  apartment: 'MyApartment',
  electronics: 'ElectroStore',
  cyber: 'DigitalManager',
};

const TABS = [
  { key: 'new', label: 'New Registrations', icon: HiUserAdd, fetcher: getNewApprovals },
  { key: 'renewal', label: 'Renewals', icon: HiRefresh, fetcher: getRenewals },
  { key: 'upgrade', label: 'Upgrades', icon: HiArrowUp, fetcher: getUpgrades },
];

const unwrap = (res) => {
  const payload = res?.data?.data || res?.data || res;
  const list = Array.isArray(payload) ? payload : payload?.approvals || [];
  return {
    list,
    pagination: res?.pagination || res?.data?.pagination || { page: 1, pages: 1, totalResults: list.length },
  };
};

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('new');
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [stats, setStats] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '', // 'confirm-payment' | 'delete'
    id: null,
    name: '',
  });

  const fetchStats = useCallback(() => {
    getApprovalStats()
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        setStats(data);
      })
      .catch(() => {});
  }, []);

  const fetchApprovals = useCallback(() => {
    setLoading(true);
    setSelected([]);
    const params = { page, limit: 20 };
    const tab = TABS.find((t) => t.key === activeTab);
    const fetcher = tab?.fetcher;
    if (!fetcher) return setLoading(false);

    fetcher(params)
      .then((res) => {
        const { list, pagination: pg } = unwrap(res);
        setApprovals(list);
        setPagination(pg);
      })
      .catch((err) => {
        console.error('Fetch approvals error:', err);
        setApprovals([]);
      })
      .finally(() => setLoading(false));
  }, [page, activeTab]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveApproval(id);
      fetchApprovals();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Approve failed: ${msg}`);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason');
      return;
    }
    setActionLoading(true);
    try {
      await rejectApproval(rejectModal.id, rejectReason);
      setRejectModal({ open: false, id: null, name: '' });
      setRejectReason('');
      fetchApprovals();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleConfirmPayment = async () => {
    setActionLoading(true);
    const { id } = confirmDialog;
    setConfirmDialog({ open: false, type: '', id: null, name: '' });
    try {
      await confirmPayment(id);
      fetchApprovals();
      fetchStats();
    } catch (err) {
      alert(`Confirm payment failed: ${err.response?.data?.message || err.message}`);
    }
    setActionLoading(false);
  };

  const handleDeleteApproval = async () => {
    setActionLoading(true);
    const { id, name } = confirmDialog;
    setConfirmDialog({ open: false, type: '', id: null, name: '' });
    try {
      const res = await deleteApproval(id);
      const report = res?.data?.data || res?.data || res;
      const total = report?.total ?? 0;
      alert(`Deleted "${name}" and ${total} related record(s).`);
      fetchApprovals();
      fetchStats();
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
    setActionLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkApprove = async () => {
    if (selected.length === 0) return alert('Select approvals first');

    const eligible = approvals.filter((a) => selected.includes(a._id) && a.paymentReceived);
    const ineligible = selected.length - eligible.length;

    if (eligible.length === 0) {
      return alert('None of the selected items have received payment yet.');
    }

    if (ineligible > 0 && !window.confirm(`${ineligible} selected item(s) are unpaid and will be skipped. Continue?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await bulkApprove(eligible.map((a) => a._id));
      const result = res?.data?.data || res?.data || res;
      if (result?.failed > 0) {
        alert(`Approved: ${result.approved}\nFailed: ${result.failed}`);
      }
      setSelected([]);
      fetchApprovals();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const getModuleIcon = (row) => {
    if (!row.businessType) return '';
    return MODULE_ICONS[row.businessType] || '';
  };

  const getModuleLabel = (row) => {
    if (row.moduleName) return row.moduleName;
    if (row.businessType) return MODULE_NAMES[row.businessType] || row.businessType;
    return null;
  };

  const columns = [
    {
      key: 'select',
      label: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.includes(row._id)}
          disabled={!row.paymentReceived}
          onChange={() => toggleSelect(row._id)}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
    },
    {
      key: 'businessName',
      label: 'Business',
      render: (row) => (
        <button
          onClick={() => setViewModal({ open: true, approval: row })}
          className={`hover:underline font-medium ${
            row.paymentReceived ? 'text-teal-600' : 'text-amber-600'
          }`}
        >
          {row.businessName || 'N/A'}
        </button>
      ),
    },
    { key: 'owner', label: 'Owner', render: (row) => row.owner?.name || '—' },
    {
      key: 'planInfo',
      label: 'Plan',
      render: (row) => (
        <div>
          <span className="font-medium text-[var(--text-primary)]">
            {row.planName || 'N/A'}
          </span>
          {row.planAmount > 0 && (
            <span className="text-xs text-[var(--text-muted)] ml-1">
              KES {Number(row.planAmount).toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'modules',
      label: 'Module',
      render: (row) => {
        const label = getModuleLabel(row);
        return label ? (
          <Badge variant="teal">
            {getModuleIcon(row)} {label}
          </Badge>
        ) : (
          <span className="text-[var(--text-muted)]">—</span>
        );
      },
    },
    {
      key: 'paymentReceived',
      label: 'Payment',
      render: (row) =>
        row.paymentReceived ? (
          <Badge variant="success">✓ Paid</Badge>
        ) : (
          <Badge variant="warning">⏳ Awaiting</Badge>
        ),
    },
    { key: 'createdAt', label: 'Applied', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setViewModal({ open: true, approval: row })}
            title="View"
          >
            <HiEye className="w-4 h-4" />
          </Button>
          {!row.paymentReceived && row.invoiceId && (
            <Button
              size="sm"
              variant="info"
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  type: 'confirm-payment',
                  id: row._id,
                  name: row.businessName,
                })
              }
              title="Confirm manual payment"
            >
              <HiCash className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="success"
            disabled={!row.paymentReceived || actionLoading}
            onClick={() => {
              if (window.confirm(`Approve ${row.businessName}?`)) handleApprove(row._id);
            }}
            title={row.paymentReceived ? 'Approve' : 'Waiting for payment'}
          >
            <HiCheck className="w-4 h-4" /> Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              setRejectModal({ open: true, id: row._id, name: row.businessName })
            }
            title="Reject"
          >
            <HiX className="w-4 h-4" /> Reject
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              setConfirmDialog({
                open: true,
                type: 'delete',
                id: row._id,
                name: row.businessName,
              })
            }
            title="Delete permanently"
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Approvals</h1>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <Badge variant="warning">{stats.new || 0} new</Badge>
              <Badge variant="info">{stats.renewals || 0} renewals</Badge>
              <Badge variant="success">{stats.paidWait || 0} paid</Badge>
            </div>
          )}
          {selected.length > 0 && (
            <Button
              size="sm"
              variant="success"
              onClick={handleBulkApprove}
              loading={actionLoading}
            >
              Bulk Approve ({selected.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
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

      <Card>
        <Table
          columns={columns}
          data={approvals}
          loading={loading}
          emptyMessage={`No ${
            activeTab === 'new' ? 'new registrations' : activeTab === 'renewal' ? 'renewals' : 'upgrades'
          } found.`}
        />
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages || pagination.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>

      {/* View Modal */}
      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, approval: null })}
        title="Approval Details"
        size="xl"
      >
        {viewModal.approval ? (
          <div className="space-y-6 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Name:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {viewModal.approval.businessName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Slug:</span>
                  <span className="text-[var(--text-primary)] text-xs">
                    {viewModal.approval.slug || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Type:</span>
                  <Badge variant="teal">{viewModal.approval.businessType || '—'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Status:</span>
                  <Badge variant="warning">{viewModal.approval.status || 'pending'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Applied:</span>
                  <span className="text-[var(--text-primary)]">
                    {formatDate(viewModal.approval.createdAt, 'full')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Payment:</span>
                  {viewModal.approval.paymentReceived ? (
                    <Badge variant="success">✓ Paid</Badge>
                  ) : (
                    <Badge variant="warning">Awaiting</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Owner</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Name:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {viewModal.approval.owner?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Email:</span>
                  <span className="text-[var(--text-primary)]">
                    {viewModal.approval.owner?.email || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Phone:</span>
                  <span className="text-[var(--text-primary)]">
                    {viewModal.approval.owner?.phone || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Plan:</span>
                  <Badge variant="teal">{viewModal.approval.planName || 'N/A'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Amount:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    KES {Number(viewModal.approval.planAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Cycle:</span>
                  <span className="text-[var(--text-primary)] capitalize">
                    {viewModal.approval.planCycle || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Module:</span>
                  <span className="text-[var(--text-primary)]">
                    {getModuleLabel(viewModal.approval) || '—'}
                  </span>
                </div>
              </div>
            </div>

            {viewModal.approval.invoice && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <h3 className="font-medium text-[var(--text-primary)] mb-3">Invoice</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Invoice #:</span>
                    <span className="text-[var(--text-primary)] font-mono text-xs">
                      {viewModal.approval.invoice.invoiceNumber || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Amount Due:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {viewModal.approval.invoice.currency || 'KES'}{' '}
                      {Number(viewModal.approval.invoice.amountDue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <Badge
                      variant={
                        viewModal.approval.invoice.status === 'paid' ? 'success' : 'warning'
                      }
                    >
                      {viewModal.approval.invoice.status || 'unpaid'}
                    </Badge>
                  </div>
                  {viewModal.approval.invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Due:</span>
                      <span className="text-[var(--text-primary)]">
                        {formatDate(viewModal.approval.invoice.dueDate, 'full')}
                      </span>
                    </div>
                  )}
                </div>
                {viewModal.approval.invoice.invoiceUrl && (
                  <a
                    href={viewModal.approval.invoice.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-teal-600 hover:underline text-xs font-medium"
                  >
                    View Full Invoice ↗
                  </a>
                )}
              </div>
            )}

            {viewModal.approval.paymentReceivedAt && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✅ Payment received
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  {formatDate(viewModal.approval.paymentReceivedAt, 'full')}
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
              <Button
                variant="danger"
                onClick={() => {
                  const a = viewModal.approval;
                  setViewModal({ open: false, approval: null });
                  setRejectModal({ open: true, id: a._id, name: a.businessName });
                }}
              >
                Reject
              </Button>
              {!viewModal.approval.paymentReceived && viewModal.approval.invoiceId && (
                <Button
                  variant="info"
                  onClick={() => {
                    const a = viewModal.approval;
                    setViewModal({ open: false, approval: null });
                    setConfirmDialog({
                      open: true,
                      type: 'confirm-payment',
                      id: a._id,
                      name: a.businessName,
                    });
                  }}
                >
                  Confirm Payment
                </Button>
              )}
              <Button
                variant="success"
                disabled={!viewModal.approval.paymentReceived || actionLoading}
                onClick={() => {
                  const a = viewModal.approval;
                  setViewModal({ open: false, approval: null });
                  if (window.confirm(`Approve ${a.businessName}?`)) handleApprove(a._id);
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Approval not found</p>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, id: null, name: '' });
          setRejectReason('');
        }}
        title={`Reject ${rejectModal.name}`}
        size="sm"
      >
        <Input
          label="Reason for rejection *"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Invalid business details"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setRejectModal({ open: false, id: null, name: '' });
              setRejectReason('');
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading}>
            Reject
          </Button>
        </div>
      </Modal>

      {/* Confirm Dialog: Confirm Payment / Delete Approval */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', id: null, name: '' })}
        onConfirm={
          confirmDialog.type === 'confirm-payment' ? handleConfirmPayment : handleDeleteApproval
        }
        title={
          confirmDialog.type === 'confirm-payment' ? 'Confirm Manual Payment' : 'Delete Approval'
        }
        message={
          confirmDialog.type === 'confirm-payment'
            ? `Mark the invoice for "${confirmDialog.name}" as paid? This will flip the tenant to "paid — awaiting approval".`
            : `Permanently delete "${confirmDialog.name}" and every related record (tenant, users, invoices, payments, subscriptions, modules, module data)? This cannot be undone.`
        }
        confirmLabel={
          confirmDialog.type === 'confirm-payment' ? 'Confirm Payment' : 'Delete Everything'
        }
        variant={confirmDialog.type === 'confirm-payment' ? 'warning' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
}