import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOwner, approveOwner, suspendOwner } from '../../services/hdmnet/owners';
import { getRevenue, getActiveUsers } from '../../services/hdmnet/reports';
import Card from '../../components/hdmnet/ui/Card';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi';

export default function OwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOwner(id),
      getRevenue(id).catch(() => null),
      getActiveUsers(id).catch(() => null),
    ])
      .then(([ownerRes, revRes, usersRes]) => {
        setOwner(ownerRes?.data || ownerRes);
        setRevenue(revRes?.data || revRes);
        setActiveUsers(usersRes?.data || usersRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveOwner(id, true);
      setOwner((prev) => ({ ...prev, status: 'active' }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await suspendOwner(id);
      setOwner((prev) => ({ ...prev, status: 'suspended' }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const formatPlanType = (type) => {
    if (!type) return 'N/A';
    const types = { one_time: 'One-Time', free_trial: 'Free Trial', monthly: 'Monthly', yearly: 'Yearly' };
    return types[type] || type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!owner) return <Card className="text-center text-[var(--text-muted)]">Owner not found</Card>;

  const statusVariant = { active: 'success', pending: 'warning', suspended: 'danger' };

  return (
    <div>
      <button
        onClick={() => navigate('/hdmnet/owners')}
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <HiArrowLeft /> Back to Owners
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {owner.business_name || 'Owner Details'}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{owner.business_email}</p>
        </div>
        <div className="flex gap-2">
          {owner.status === 'pending' && (
            <Button variant="success" onClick={handleApprove} loading={actionLoading}>
              <HiCheck className="w-4 h-4 mr-1" /> Approve
            </Button>
          )}
          {owner.status === 'active' && (
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>
              <HiX className="w-4 h-4 mr-1" /> Suspend
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Info */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Owner Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Business:</dt>
              <dd className="text-[var(--text-primary)] font-medium">{owner.business_name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Email:</dt>
              <dd className="text-[var(--text-primary)]">{owner.business_email || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Phone:</dt>
              <dd className="text-[var(--text-primary)]">{owner.business_phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Location:</dt>
              <dd className="text-[var(--text-primary)]">{owner.location || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Status:</dt>
              <dd>
                <Badge variant={statusVariant[owner.status] || 'default'}>{owner.status}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Platform Fee:</dt>
              <dd className="text-[var(--text-primary)]">{owner.platform_fee_percent || 0}%</dd>
            </div>
          </dl>
        </Card>

        {/* Subscription */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Subscription</h2>
          {owner.owner_plan ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Plan:</dt>
                <dd className="text-[var(--text-primary)] font-medium">{owner.owner_plan.name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Type:</dt>
                <dd className="text-[var(--text-primary)]">
                  <Badge variant="info">{formatPlanType(owner.owner_plan.plan_type)}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Price:</dt>
                <dd className="text-[var(--text-primary)] font-medium">KES {owner.owner_plan.price?.toLocaleString() || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Started:</dt>
                <dd className="text-[var(--text-primary)]">{formatDate(owner.subscription_start)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Expires:</dt>
                <dd className="text-[var(--text-primary)]">
                  {owner.subscription_end ? formatDate(owner.subscription_end) : 'Lifetime'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No plan assigned</p>
          )}
        </Card>

        {/* Revenue */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Revenue</h2>
          {revenue ? (
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {revenue.total ? `KES ${revenue.total.toLocaleString()}` : 'N/A'}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Total platform fees collected</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No revenue data</p>
          )}
        </Card>

        {/* Active Users */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Active Users</h2>
          {activeUsers ? (
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {activeUsers.count || activeUsers || 0}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Currently connected</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No user data</p>
          )}
        </Card>
      </div>
    </div>
  );
}