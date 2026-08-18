import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProvider, updateProviderCommission, adjustProviderWallet } from '../../services/hdmnet/providers';
import Card from '../../components/hdmnet/ui/Card';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Input from '../../components/hdmnet/ui/Input';
import Modal from '../../components/hdmnet/ui/Modal';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commissionModal, setCommissionModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(0);
  const [walletModal, setWalletModal] = useState(false);
  const [walletForm, setWalletForm] = useState({ amount: 0, type: 'credit', description: '' });

  const fetchProvider = () => {
    getProvider(id)
      .then(res => {
        const p = res?.data?.provider || res?.data || res;
        setProvider(p);
        setCommissionRate(p.commissionRate || 0);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProvider(); }, [id]);

  const handleCommission = async () => {
    setActionLoading(true);
    try { await updateProviderCommission(id, { commissionRate }); setCommissionModal(false); fetchProvider(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleWallet = async () => {
    setActionLoading(true);
    try { await adjustProviderWallet(id, walletForm); setWalletModal(false); fetchProvider(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!provider) return <div className="text-center py-20 text-[var(--text-muted)]">Provider not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/hdmnet/providers')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{provider.businessName || provider.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{provider.email || provider.owner?.email}</p>
          </div>
          <Badge variant={provider.status === 'active' ? 'success' : 'danger'}>{provider.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setCommissionRate(provider.commissionRate || 0); setCommissionModal(true); }}>Commission</Button>
          <Button variant="secondary" onClick={() => { setWalletForm({ amount: 0, type: 'credit', description: '' }); setWalletModal(true); }}>Wallet</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Provider Info</h2>
          <div className="space-y-2 text-sm">
            <Row label="Business Name" value={provider.businessName || provider.name} />
            <Row label="Owner" value={provider.owner?.name} />
            <Row label="Email" value={provider.email || provider.owner?.email} />
            <Row label="Phone" value={provider.phone || provider.owner?.phone} />
            <Row label="Wallet Balance" value={provider.walletBalance} bold />
            <Row label="Commission Rate" value={`${provider.commissionRate || 0}%`} />
            <Row label="Joined" value={formatDate(provider.createdAt, 'full')} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Routers</h2>
          {provider.routers?.length > 0 ? (
            <div className="space-y-2">
              {provider.routers.map((router, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
                  <span className="text-sm text-[var(--text-primary)]">{router.name || router.id}</span>
                  <Badge variant={router.online ? 'success' : 'danger'}>{router.online ? 'Online' : 'Offline'}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No routers registered.</p>}
        </Card>
      </div>

      <Modal open={commissionModal} onClose={() => setCommissionModal(false)} title="Update Commission" size="sm">
        <Input label="Commission Rate (%)" type="number" value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setCommissionModal(false)}>Cancel</Button>
          <Button onClick={handleCommission} loading={actionLoading}>Save</Button>
        </div>
      </Modal>

      <Modal open={walletModal} onClose={() => setWalletModal(false)} title="Adjust Wallet" size="sm">
        <div className="space-y-4">
          <Input label="Amount" type="number" value={walletForm.amount} onChange={e => setWalletForm({ ...walletForm, amount: +e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={walletForm.type} onChange={e => setWalletForm({ ...walletForm, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['credit', 'debit'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Description" value={walletForm.description} onChange={e => setWalletForm({ ...walletForm, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWalletModal(false)}>Cancel</Button>
            <Button onClick={handleWallet} loading={actionLoading}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}