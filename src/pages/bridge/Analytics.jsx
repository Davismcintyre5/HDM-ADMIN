import { useEffect, useState } from 'react';
import { getUserGrowth, getEmailVolume, getRevenue, getPlanDistribution } from '../../services/bridge/analytics';
import Card from '../../components/bridge/ui/Card';
import Spinner from '../../components/bridge/ui/Spinner';
import Badge from '../../components/bridge/ui/Badge';

export default function Analytics() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [emailVolume, setEmailVolume] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [planDist, setPlanDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserGrowth(), getEmailVolume(), getRevenue(), getPlanDistribution()])
      .then(([u, e, r, p]) => {
        setUserGrowth(u.growth || u.data || []);
        setEmailVolume(e.volume || e.data || []);
        setRevenue(r.revenue || r.data || r);
        setPlanDist(p.distribution || p.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const maxGrowth = Math.max(...userGrowth.map(d => d.count || 0), 1);
  const maxVolume = Math.max(...emailVolume.map(d => d.sent || 0), 1);
  const revenueArr = Array.isArray(revenue) ? revenue : (revenue?.revenue || []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold mb-4">User Growth (12 Months)</h3>
          {userGrowth.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No data</p> : (
            <div className="space-y-1">
              {userGrowth.slice(-12).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-[var(--text-muted)]">{d._id?.year}-{String(d._id?.month).padStart(2, '0')}</span>
                  <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-4">
                    <div className="bg-indigo-500 h-4 rounded-full flex items-center justify-end pr-1" style={{ width: `${Math.min((d.count / maxGrowth) * 100, 100)}%` }}>
                      {d.count > 0 && <span className="text-[10px] text-white">{d.count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Email Volume (30 Days)</h3>
          {emailVolume.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No data</p> : (
            <div className="space-y-1">
              {emailVolume.slice(-12).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-[var(--text-muted)]">{d._id}</span>
                  <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-4">
                    <div className="bg-indigo-500 h-4 rounded-full flex items-center justify-end pr-1" style={{ width: `${Math.min((d.sent / maxVolume) * 100, 100)}%` }}>
                      {d.sent > 0 && <span className="text-[10px] text-white">{d.sent}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">Revenue</h3>
          {revenueArr.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No data</p> : (
            <div className="space-y-2">
              {revenueArr.slice(-6).map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">{r._id}</span>
                  <span className="font-medium">${r.total?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Plan Distribution</h3>
          {planDist.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No data</p> : (
            <div className="space-y-2">
              {planDist.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <Badge variant="indigo">{p._id?.plan || p.plan}</Badge>
                  <span className="text-[var(--text-secondary)]">{p.count} users | MRR ${p.mrr?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}