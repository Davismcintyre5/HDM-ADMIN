import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOrganization, suspendOrganization, reactivateOrganization, deleteOrganization } from '../../../services/vault/organizations';
import Card from '../../../components/vault/ui/Card';
import Badge from '../../../components/vault/ui/Badge';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import ConfirmDialog from '../../../components/vault/ui/ConfirmDialog';
import { formatDate } from '../../../utils/vault/formatDate';
import { HiArrowLeft, HiKey, HiEye, HiEyeOff, HiClipboardCopy } from 'react-icons/hi';

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrg = () => {
    setLoading(true);
    getOrganization(id)
      .then(setOrg)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrg(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendOrganization(id);
      else if (confirm.type === 'reactivate') await reactivateOrganization(id);
      else if (confirm.type === 'delete') {
        await deleteOrganization(id);
        navigate('/hdmvault/organizations');
        return;
      }
      setConfirm({ open: false, type: '' });
      fetchOrg();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const copyLicenseKey = () => {
    if (org?.licenseId?.licenseKey) {
      navigator.clipboard.writeText(org.licenseId.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!org) return <Card className="text-center text-red-500">Organization not found</Card>;

  const statusV = { active: 'success', suspended: 'danger', trial: 'warning' };

  return (
    <div>
      <button onClick={() => navigate('/hdmvault/organizations')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Organizations
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{org.name || 'Organization Detail'}</h1>
        <div className="flex gap-2">
          {org.status === 'active' && <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}>Suspend</Button>}
          {org.status === 'suspended' && <Button variant="success" onClick={() => setConfirm({ open: true, type: 'reactivate' })}>Reactivate</Button>}
          <Button variant="danger" onClick={() => setConfirm({ open: true, type: 'delete' })}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {org.licenseId?.licenseKey && (
          <Card className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <HiKey className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">License Key</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {org.licenseId.planTier} • {org.licenseId.planType} • Expires {formatDate(org.licenseId.expiresAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-[var(--bg-tertiary)] px-4 py-2 rounded text-sm select-all break-all">
                {showKey ? org.licenseId.licenseKey : '••••••••••••••••••••••••'}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)]">
                {showKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
              <button onClick={copyLicenseKey} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)]">
                <HiClipboardCopy className="w-5 h-5" />
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
          </Card>
        )}

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)]">{org.name || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Plan:</dt><dd><Badge variant="orange">{org.planTier || 'N/A'}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusV[org.status] || 'default'}>{org.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Max Users:</dt><dd className="text-[var(--text-primary)]">{org.maxUsers || 0}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Max Devices:</dt><dd className="text-[var(--text-primary)]">{org.maxDevicesPerUser || 0}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Created:</dt><dd className="text-[var(--text-primary)]">{formatDate(org.createdAt, 'full')}</dd></div>
          </dl>
        </Card>

        {org.ownerId && (
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Owner</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)]">{org.ownerId.fullName || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{org.ownerId.email || 'N/A'}</dd></div>
            </dl>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, type: '' })}
        title={confirm.type === 'delete' ? 'Delete Organization' : confirm.type === 'suspend' ? 'Suspend Organization' : 'Reactivate Organization'}
        message={confirm.type === 'delete' ? 'Permanently delete this organization and ALL its users and data? This cannot be undone.' : `${confirm.type} this organization?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}