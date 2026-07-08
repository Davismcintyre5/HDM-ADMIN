import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStore, suspendStore, activateStore, changeStoreTier } from '../../services/marketbridge/stores';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Spinner from '../../components/marketbridge/ui/Spinner';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiArrowLeft, HiBan, HiCheck } from 'react-icons/hi';

const TIERS = ['basic', 'pro', 'enterprise'];

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStore = () => {
    setLoading(true);
    getStore(id)
      .then(res => setStore(res?.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStore(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendStore(id);
      else if (confirm.type === 'activate') await activateStore(id);
      fetchStore();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, type: '' });
  };

  const handleTierChange = async (tier) => {
    if (!confirm(`Change tier to ${tier}?`)) return;
    setActionLoading(true);
    try { await changeStoreTier(id, tier); fetchStore(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusVariant = { active: 'success', pending: 'warning', suspended: 'danger' };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!store) return <Card className="text-center text-[var(--text-muted)]">Store not found</Card>;

  return (
    <div>
      <button onClick={() => navigate('/marketbridge/stores')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Stores
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{store.name || 'Store Details'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{store.subdomain}.marketbridge.co.ke</p>
        </div>
        <div className="flex gap-2">
          {store.status === 'active' && <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}><HiBan className="w-4 h-4 mr-1" /> Suspend</Button>}
          {store.status === 'suspended' && <Button variant="success" onClick={() => setConfirm({ open: true, type: 'activate' })}><HiCheck className="w-4 h-4 mr-1" /> Activate</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Info */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Store Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)] font-medium">{store.name}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Subdomain:</dt><dd className="text-[var(--text-primary)]">{store.subdomain}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Description:</dt><dd className="text-[var(--text-primary)] text-xs">{store.description || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Tier:</dt><dd>
              <div className="flex items-center gap-1">
                {TIERS.map(t => (
                  <button key={t} onClick={() => handleTierChange(t)}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${store.tier === t ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusVariant[store.status] || 'default'}>{store.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Commission:</dt><dd className="text-[var(--text-primary)] font-bold">{store.commissionRate || 10}%</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Rating:</dt><dd className="text-[var(--text-primary)]">⭐ {store.rating || 0} ({store.totalReviews || 0} reviews)</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Total Sales:</dt><dd className="text-[var(--text-primary)]">{(store.totalSales || 0).toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Joined:</dt><dd className="text-[var(--text-primary)]">{formatDate(store.createdAt)}</dd></div>
            {store.subscriptionExpiry && <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Subscription Expires:</dt><dd className="text-[var(--text-primary)]">{formatDate(store.subscriptionExpiry)}</dd></div>}
          </dl>
        </Card>

        {/* Owner Info */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Owner</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)] font-medium">{store.vendorId?.name || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{store.vendorId?.email || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{store.vendorId?.phone || '—'}</dd></div>
          </dl>
        </Card>

        {/* Features */}
        {store.features && (
          <Card className="md:col-span-2">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-[var(--text-primary)]">{store.features.maxProducts === 999999 ? '∞' : store.features.maxProducts}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Max Products</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <Badge variant={store.features.canCreateVouchers ? 'success' : 'default'}>{store.features.canCreateVouchers ? '✅' : '❌'}</Badge>
                <p className="text-xs text-[var(--text-muted)] mt-1">Vouchers</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <Badge variant={store.features.canCreateHotDeals ? 'success' : 'default'}>{store.features.canCreateHotDeals ? '✅' : '❌'}</Badge>
                <p className="text-xs text-[var(--text-muted)] mt-1">Hot Deals</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <Badge variant={store.features.canRunFlashSales ? 'success' : 'default'}>{store.features.canRunFlashSales ? '✅' : '❌'}</Badge>
                <p className="text-xs text-[var(--text-muted)] mt-1">Flash Sales</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <Badge variant={store.features.canBoostNewArrivals ? 'success' : 'default'}>{store.features.canBoostNewArrivals ? '✅' : '❌'}</Badge>
                <p className="text-xs text-[var(--text-muted)] mt-1">Boost New</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, type: '' })} onConfirm={handleAction}
        title={confirm.type === 'suspend' ? 'Suspend Store' : 'Activate Store'} message={`${confirm.type === 'suspend' ? 'Suspend' : 'Activate'} ${store.name}?`}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : 'Activate'} variant={confirm.type === 'suspend' ? 'warning' : 'success'} loading={actionLoading} />
    </div>
  );
}