import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient } from '../../services/smartpos/clients';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(id)
      .then(res => setData(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data?.client) return <div className="text-center py-20 text-[var(--text-muted)]">Client not found.</div>;

  const { client, subscriptions, payments } = data;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/smartpos/clients')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><HiArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{client.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{client.ownerEmail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <Row label="Owner" value={client.ownerName} />
            <Row label="Email" value={client.ownerEmail} />
            <Row label="Plan" value={client.plan} />
            <Row label="Status" value={client.status} />
            <Row label="Subscription Currency" value={client.subscriptionCurrency} />
            <Row label="Store Currency" value={client.storeCurrency} />
            <Row label="Period Start" value={client.periodStart ? formatDate(client.periodStart) : '—'} />
            <Row label="Period End" value={client.periodEnd ? formatDate(client.periodEnd) : '—'} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Subscriptions ({subscriptions?.length || 0})</h2>
          {subscriptions?.length > 0 ? (
            <div className="space-y-2">
              {subscriptions.map((s, i) => (
                <div key={i} className="p-2 bg-[var(--bg-secondary)] rounded text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-primary)]">{s.plan}</span>
                    <Badge variant="info">{s.status}</Badge>
                  </div>
                  <p className="text-[var(--text-muted)] mt-1">{formatDate(s.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No subscriptions.</p>}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Payments ({payments?.length || 0})</h2>
          {payments?.length > 0 ? (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="p-2 bg-[var(--bg-secondary)] rounded text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-primary)]">{p.currency} {(p.amountMinor / 100).toLocaleString()}</span>
                    <Badge variant="info">{p.status}</Badge>
                  </div>
                  <p className="text-[var(--text-muted)] mt-1">{formatDate(p.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No payments.</p>}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className="text-[var(--text-primary)]">{value ?? '—'}</span></div>;
}