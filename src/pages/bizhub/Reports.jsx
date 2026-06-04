import { useEffect, useState } from 'react';
import { getRevenueReport, getUserGrowthReport, getSystemUsageReport, exportReport } from '../../services/bizhub/reports';
import Card from '../../components/bizhub/ui/Card';
import Button from '../../components/bizhub/ui/Button';
import Spinner from '../../components/bizhub/ui/Spinner';
import Badge from '../../components/bizhub/ui/Badge';
import { HiDownload } from 'react-icons/hi';

export default function Reports() {
  const [revenue, setRevenue] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [systemUsage, setSystemUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRevenueReport(), getUserGrowthReport(), getSystemUsageReport()])
      .then(([r, u, s]) => {
        setRevenue(r.summary || r.data?.summary || r);
        setUserGrowth(Array.isArray(u.data || u) ? (u.data || u) : []);
        setSystemUsage(Array.isArray(s.data || s) ? (s.data || s) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type) => {
    try {
      const blob = await exportReport(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${type}-report.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (err) { alert('Export failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const chartData = revenue?.chartData || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reports</h1>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-[var(--text-secondary)]">Total Revenue</h3>
          <p className="text-2xl font-bold text-teal-600 mt-1">KES {(revenue?.totalRevenue || 0).toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-[var(--text-secondary)]">Total Subscriptions</h3>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{revenue?.totalSubscriptions || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-[var(--text-secondary)]">Average Revenue</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">KES {(revenue?.averageRevenue || 0).toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Monthly Revenue</h2>
            <Button size="sm" variant="outline" onClick={() => handleExport('revenue')}><HiDownload className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {(chartData.monthly || []).map((m, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{m.month}</span>
                <span className="font-medium">KES {m.revenue?.toLocaleString()}</span>
              </div>
            ))}
            {(!chartData.monthly || chartData.monthly.length === 0) && (
              <p className="text-sm text-[var(--text-muted)]">No data yet</p>
            )}
          </div>
        </Card>

        {/* By Module */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">By Module</h2>
            <Button size="sm" variant="outline" onClick={() => handleExport('usage')}><HiDownload className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {(chartData.byModule || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="teal">{m.name}</Badge>
                </div>
                <span className="font-medium">KES {m.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* By Plan */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">By Plan</h2>
            <Button size="sm" variant="outline" onClick={() => handleExport('users')}><HiDownload className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {(chartData.byPlan || []).map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{p.name}</span>
                <span className="font-medium">KES {p.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}