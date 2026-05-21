import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTenant, suspendTenant, deleteTenant } from '../../services/hdmerp/tenants';
import Card from '../../components/hdmerp/ui/Card';
import Badge from '../../components/hdmerp/ui/Badge';
import Button from '../../components/hdmerp/ui/Button';
import Spinner from '../../components/hdmerp/ui/Spinner';
import ConfirmDialog from '../../components/hdmerp/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmerp/formatDate';
import { HiArrowLeft, HiKey, HiClipboardCopy, HiEye, HiEyeOff } from 'react-icons/hi';

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTenant = () => {
    setLoading(true);
    getTenant(id)
      .then(setTenant)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenant(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendTenant(id);
      else await deleteTenant(id);
      fetchTenant();
      setConfirm({ open: false, type: '' });
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const copyLicenseKey = () => {
    if (tenant.licenseKey) {
      navigator.clipboard.writeText(tenant.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!tenant) return null;

  const statusVariant = { active: 'success', suspended: 'warning', pending: 'default', deleted: 'danger' };

  return (
    <div>
      <button onClick={() => navigate('/hdmerp/tenants')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Tenants
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{tenant.companyName || 'Tenant Details'}</h1>
        <div className="flex gap-2">
          {tenant.status === 'active' && (
            <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}>Suspend</Button>
          )}
          <Button variant="danger" onClick={() => setConfirm({ open: true, type: 'delete' })}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* License Key Card */}
        <Card className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <HiKey className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">License Key</h2>
              <p className="text-xs text-[var(--text-muted)]">Unique key for this tenant</p>
            </div>
          </div>
          {tenant.licenseKey ? (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text-primary)] break-all select-all">
                {showKey ? tenant.licenseKey : '••••••••••••••••••••••••••••'}
              </div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] transition-colors"
                title={showKey ? 'Hide' : 'Show'}
              >
                {showKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
              <button
                onClick={copyLicenseKey}
                className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] transition-colors"
                title="Copy"
              >
                <HiClipboardCopy className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] mt-2">No license key assigned</p>
          )}
          {copied && <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>}
        </Card>

        {/* General Info */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">General Info</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Legal Name:</dt><dd className="text-[var(--text-primary)]">{tenant.legalName || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Plan:</dt><dd><Badge variant="info">{tenant.plan}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusVariant[tenant.status]}>{tenant.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{tenant.contactEmail || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{tenant.contactPhone || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Currency:</dt><dd className="text-[var(--text-primary)]">{tenant.currency}</dd></div>
          </dl>
        </Card>

        {/* Address */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Address</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Street:</dt><dd className="text-[var(--text-primary)]">{tenant.address?.street || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">City:</dt><dd className="text-[var(--text-primary)]">{tenant.address?.city || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">State:</dt><dd className="text-[var(--text-primary)]">{tenant.address?.state || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Country:</dt><dd className="text-[var(--text-primary)]">{tenant.address?.country}</dd></div>
          </dl>
        </Card>

        {/* Dates */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Dates</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Created:</dt><dd className="text-[var(--text-primary)]">{formatDate(tenant.createdAt, 'full')}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Expiry:</dt><dd className="text-[var(--text-primary)]">{formatDate(tenant.subscriptionExpiry, 'full')}</dd></div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, type: '' })}
        title={confirm.type === 'suspend' ? 'Suspend Tenant' : 'Delete Tenant'}
        message={confirm.type === 'suspend' ? 'Suspend this tenant?' : 'Permanently delete this tenant?'}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : 'Delete'}
        variant={confirm.type === 'suspend' ? 'warning' : 'danger'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}