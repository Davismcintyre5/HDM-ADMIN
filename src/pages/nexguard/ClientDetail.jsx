import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, suspendClient, reactivateClient, deleteClient } from '../../services/nexguard/clients';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Spinner from '../../components/nexguard/ui/Spinner';
import StatCard from '../../components/nexguard/ui/StatCard';
import { formatDate } from '../../utils/nexguard/formatDate';
import {
  HiArrowLeft, HiDesktopComputer, HiExclamation, HiSearch,
  HiGlobe, HiCreditCard, HiKey, HiBadgeCheck,
} from 'react-icons/hi';

const statusVariant = {
  active: 'success', trial: 'info', expired: 'warning',
  cancelled: 'danger', suspended: 'danger', none: 'default',
};
const deviceStatusVariant = { online: 'success', offline: 'warning' };
const licenseStatusVariant = { active: 'success', expired: 'danger', revoked: 'danger' };

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchClient = () => {
    setLoading(true);
    getClient(id)
      .then(res => setClient(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClient(); }, [id]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await suspendClient(id, { reason: suspendReason });
      setSuspendModal(false);
      setSuspendReason('');
      fetchClient();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivateClient(id);
      fetchClient();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteClient(id);
      navigate('/nexguard/clients');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const formatAmount = (amount, currency) => {
    if (amount == null) return '—';
    return `${currency || ''} ${Number(amount).toLocaleString()}`.trim();
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!client) return <div className="text-center py-20 text-[var(--text-muted)]">Client not found.</div>;

  const { subscription, licenses, stats, recentPayments } = client;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/nexguard/clients')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{client.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{client.email}</p>
          </div>
          <Badge variant={statusVariant[client.subscriptionStatus] || 'default'}>
            {client.subscriptionStatus || 'none'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {client.status === 'suspended' ? (
            <Button variant="success" onClick={handleReactivate} loading={actionLoading}>Reactivate</Button>
          ) : (
            <Button variant="warning" onClick={() => setSuspendModal(true)} disabled={client.status !== 'active'}>Suspend</Button>
          )}
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={HiKey} label="Licenses" value={stats?.totalLicenses || 0} sub={`${stats?.activeLicenses || 0} active`} />
        <StatCard icon={HiDesktopComputer} label="Devices" value={stats?.totalDevices || 0} sub={`${stats?.activeDevices || 0} active`} />
        <StatCard icon={HiExclamation} label="Alerts" value={stats?.totalAlerts || 0} sub={`${stats?.criticalAlerts || 0} critical`} />
        <StatCard icon={HiSearch} label="Scans" value={stats?.totalScans || 0} />
        <StatCard icon={HiGlobe} label="VPN Sessions" value={stats?.totalVpnSessions || 0} />
        <StatCard icon={HiCreditCard} label="Total Paid" value={formatAmount(stats?.totalPaid, '')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={client.name} />
            <Row label="Email" value={client.email} />
            <Row label="Status" value={client.status} />
            <Row label="Email Verified" value={client.emailVerified ? 'Yes' : 'No'} />
            <Row label="2FA" value={client.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
            <Row label="Registered" value={formatDate(client.registeredAt, 'full')} />
            <Row label="Last Login" value={client.lastLogin ? formatDate(client.lastLogin, 'full') : '—'} />
            <Row label="Last IP" value={client.lastLoginIp} />
          </div>
        </Card>

        {/* Subscription */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Subscription</h2>
          {subscription ? (
            <div className="space-y-3 text-sm">
              <Row label="Plan" value={subscription.plan} />
              <Row label="Billing" value={subscription.billing} capitalize />
              <Row label="Status">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[subscription.status] || 'default'}>{subscription.status}</Badge>
                  {(subscription.status === 'trial' || (subscription.status === 'active' && subscription.billing === 'monthly')) && subscription.currentPeriodEnd && (
                    <SubscriptionRemaining endDate={subscription.currentPeriodEnd} />
                  )}
                </div>
              </Row>

              {(subscription.status === 'trial' || (subscription.status === 'active' && subscription.billing === 'monthly')) && subscription.currentPeriodEnd && (
                <CountdownBadge
                  endDate={subscription.currentPeriodEnd}
                  label={subscription.status === 'trial' ? 'Trial ends in' : 'Renews in'}
                />
              )}

              <Row label="Period Start" value={formatDate(subscription.currentPeriodStart)} />
              <Row label="Period End" value={formatDate(subscription.currentPeriodEnd)} />
              <Row label="Auto Renew" value={subscription.autoRenew ? 'Yes' : 'No'} />
              <Row label="Device Limit" value={subscription.deviceLimit} />
              <Row label="Scans/Day" value={subscription.scansPerDay} />
              <Row label="VPN" value={subscription.vpnIncluded ? 'Included' : 'Not Included'} />
              <Row label="Bandwidth" value={`${subscription.bandwidthLimitGB} GB`} />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No active subscription.</p>
          )}
        </Card>

        {/* Licenses */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Licenses</h2>
          {licenses?.length > 0 ? (
            <div className="space-y-3">
              {licenses.map(license => (
                <div key={license._id || license.key} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HiBadgeCheck className="w-4 h-4 text-cyan-600" />
                      <span className="font-mono text-xs text-[var(--text-primary)]">{license.key}</span>
                    </div>
                    <Badge variant={licenseStatusVariant[license.status] || 'default'}>{license.status}</Badge>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    <p>Plan: <span className="text-[var(--text-primary)]">{license.plan}</span></p>
                    <p>Devices: <span className="text-[var(--text-primary)]">{license.devices?.length || 0}</span></p>
                    {license.devices?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {license.devices.map(device => (
                          <div key={device._id || device.deviceId} className="flex items-center justify-between pl-2 border-l-2 border-[var(--border-color)]">
                            <span className="text-[var(--text-primary)]">{device.deviceName}</span>
                            <Badge variant={deviceStatusVariant[device.status] || 'default'}>{device.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No licenses issued.</p>
          )}
        </Card>
      </div>

      {/* Recent Payments */}
      {recentPayments?.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Payments</h2>
          <div className="space-y-2">
            {recentPayments.map(payment => (
              <div key={payment._id} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg text-sm">
                <span className="text-[var(--text-primary)] font-medium">{formatAmount(payment.amount, payment.currency)}</span>
                <Badge variant="info">{payment.method?.replace(/_/g, ' ')}</Badge>
                <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>{payment.status}</Badge>
                <span className="text-xs text-[var(--text-muted)]">{formatDate(payment.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suspend Modal */}
      <Modal open={suspendModal} onClose={() => { setSuspendModal(false); setSuspendReason(''); }} title="Suspend Client">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will suspend {client.name}'s account. They will not be able to log in.
        </p>
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setSuspendModal(false); setSuspendReason(''); }}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete}
        title="Delete Client" message={`Permanently delete ${client.name}? This action cannot be undone.`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function SubscriptionRemaining({ endDate }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      if (!endDate) return;
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 30) {
        setRemaining(`${Math.floor(days / 30)}mo ${days % 30}d`);
      } else {
        setRemaining(`${days}d left`);
      }
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!remaining) return null;

  return (
    <span className={`text-xs font-medium ${
      remaining === 'Expired' ? 'text-red-500' : 'text-[var(--text-muted)]'
    }`}>
      · {remaining}
    </span>
  );
}

function CountdownBadge({ endDate, label }) {
  const [countdown, setCountdown] = useState(null);

  const calc = useCallback(() => {
    if (!endDate) return null;
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
    return {
      expired: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, [endDate]);

  useEffect(() => {
    setCountdown(calc());
    const interval = setInterval(() => setCountdown(calc()), 60000);
    return () => clearInterval(interval);
  }, [calc]);

  if (!countdown) return null;

  const isUrgent = countdown.days <= 7 && !countdown.expired;

  return (
    <div className={`p-3 rounded-lg text-center ${
      countdown.expired
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        : isUrgent
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
          : 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800'
    }`}>
      {countdown.expired ? (
        <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Expired</p>
      ) : (
        <>
          <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
          <p className={`font-bold text-lg ${
            isUrgent ? 'text-yellow-600 dark:text-yellow-400' : 'text-cyan-600 dark:text-cyan-400'
          }`}>
            {countdown.days > 0 && `${countdown.days}d `}{countdown.hours}h {countdown.minutes}m
          </p>
        </>
      )}
    </div>
  );
}

function Row({ label, value, capitalize, children }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || (
        <span className={`text-[var(--text-primary)] font-medium ${capitalize ? 'capitalize' : ''}`}>
          {value ?? '—'}
        </span>
      )}
    </div>
  );
}