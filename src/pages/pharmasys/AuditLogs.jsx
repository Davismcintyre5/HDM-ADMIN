import { useEffect, useState } from 'react';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Input from '../../components/pharmasys/ui/Input';
import Select from '../../components/pharmasys/ui/Select';
import Pagination from '../../components/pharmasys/ui/Pagination';
import { getAuditLogs } from '../../services/pharmasys/audit';
import { formatDateTime, relativeTime } from '../../utils/pharmasys/formatDate';
import { humanizeAction } from '../../utils/pharmasys/formatters';

const COMMON_ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'admin.login', label: 'Admin Login' },
  { value: 'admin.logout', label: 'Admin Logout' },
  { value: 'tenant.update', label: 'Tenant Update' },
  { value: 'tenant.suspend', label: 'Tenant Suspend' },
  { value: 'tenant.reactivate', label: 'Tenant Reactivate' },
  { value: 'tenant.impersonate', label: 'Tenant Impersonate' },
  { value: 'plan.create', label: 'Plan Create' },
  { value: 'plan.update', label: 'Plan Update' },
  { value: 'plan.deactivate', label: 'Plan Deactivate' },
  { value: 'plan.delete', label: 'Plan Delete' },
  { value: 'pending.approve', label: 'Pending Approve' },
  { value: 'pending.reject', label: 'Pending Reject' },
  { value: 'pending.confirm_payment', label: 'Pending Confirm Payment' },
  { value: 'payment.mark_paid', label: 'Payment Mark Paid' },
  { value: 'payment.mark_failed', label: 'Payment Mark Failed' },
  { value: 'payment.refund', label: 'Payment Refund' },
  { value: 'invoice.mark_paid', label: 'Invoice Mark Paid' },
  { value: 'invoice.cancel', label: 'Invoice Cancel' },
  { value: 'invoice.resend', label: 'Invoice Resend' },
  { value: 'payment_method.update', label: 'Payment Method Update' },
  { value: 'settings.update', label: 'Settings Update' },
  { value: 'settings.update_features', label: 'Settings Update Features' },
  { value: 'settings.update_ai', label: 'Settings Update AI' },
  { value: 'settings.update_mpesa', label: 'Settings Update M-Pesa' },
  { value: 'backup.run', label: 'Backup Run' },
  { value: 'backup.restore', label: 'Backup Restore' },
  { value: 'backup.delete', label: 'Backup Delete' },
  { value: 'backup.settings.update', label: 'Backup Settings Update' },
  { value: 'legal.publish', label: 'Legal Publish' },
  { value: 'legal.set_current', label: 'Legal Set Current' },
];

function actionVariant(action) {
  const a = String(action || '');
  if (a.includes('delete') || a.includes('reject') || a.includes('suspend')) {
    return 'danger';
  }
  if (a.includes('refund') || a.includes('cancel')) return 'warning';
  if (a.includes('approve') || a.includes('mark_paid')) return 'success';
  if (a.includes('create') || a.includes('publish')) return 'info';
  if (a.includes('login') || a.includes('logout')) return 'default';
  return 'neutral';
}

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');

  const useCustom = action === '__custom__';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {
      page,
      limit: 20,
    };

    if (useCustom) {
      if (customAction.trim()) params.action = customAction.trim();
    } else if (action) {
      params.action = action;
    }

    if (tenantFilter.trim()) params.tenantId = tenantFilter.trim();

    getAuditLogs(params)
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, action, customAction, tenantFilter, useCustom]);

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant={actionVariant(row.action)} dot>
              {humanizeAction(row.action)}
            </Badge>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            {row.action}
          </p>
        </div>
      ),
    },
    {
      key: 'adminId',
      label: 'Admin',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">
            {row.adminName || row.admin?.fullName || '—'}
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            {row.adminId ? String(row.adminId).slice(-8) : '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'tenantId',
      label: 'Tenant',
      render: (row) => (
        <div>
          {row.tenantName && (
            <p className="text-sm text-[var(--text-primary)]">
              {row.tenantName}
            </p>
          )}
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            {row.tenantId ? String(row.tenantId).slice(-8) : '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => (
        <span
          className="text-xs text-[var(--text-secondary)] block max-w-[220px] truncate"
          title={row.reason || ''}
        >
          {row.reason || '—'}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (row) => (
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {row.ip || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => (
        <div>
          <p className="text-xs text-[var(--text-primary)]">
            {relativeTime(row.createdAt)}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {row.createdAt ? formatDateTime(row.createdAt) : '—'}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Audit log
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} recorded admin actions
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Filter by action"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              options={[
                ...COMMON_ACTIONS,
                { value: '__custom__', label: 'Custom action…' },
              ]}
            />
            <Input
              label="Tenant ID"
              hint="Optional — filter by tenant"
              value={tenantFilter}
              onChange={(e) => {
                setTenantFilter(e.target.value);
                setPage(1);
              }}
              placeholder="507f1f77bcf86cd799439011"
            />
          </div>

          {useCustom && (
            <Input
              label="Custom action"
              value={customAction}
              onChange={(e) => {
                setCustomAction(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. tenant.suspend"
            />
          )}
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No actions match your filters"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}