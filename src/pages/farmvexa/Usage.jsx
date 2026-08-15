import { useState, useEffect } from 'react';
import { getTotalUsage, getFarmsUsage, getUserUsage } from '../../services/farmvexa/usage';
import Card from '../../components/farmvexa/ui/Card';
import Input from '../../components/farmvexa/ui/Input';
import Button from '../../components/farmvexa/ui/Button';
import Badge from '../../components/farmvexa/ui/Badge';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { HiSearch } from 'react-icons/hi';

export default function Usage() {
  const [total, setTotal] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLookup, setUserLookup] = useState('');
  const [userUsage, setUserUsage] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    Promise.all([getTotalUsage(), getFarmsUsage()])
      .then(([t, f]) => {
        setTotal(t?.data?.usage || t?.data || {});
        setFarms(f?.data?.farms || f?.data || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUserLookup = async () => {
    if (!userLookup.trim()) return;
    setLookupLoading(true);
    try {
      const res = await getUserUsage(userLookup.trim());
      setUserUsage(res?.data || res);
    } catch (err) { alert('User not found or no usage data'); }
    setLookupLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const maxRequests = Math.max(...farms.map(f => f.usage?.today || 0), 1);

  const byEndpoint = total?.byEndpoint || {};
  const chatCount = byEndpoint.chat || 0;
  const cropCount = byEndpoint.crop_analysis || 0;
  const fieldScanCount = byEndpoint.field_scan || 0;

  const byKey = total?.byKey || {};
  const primaryCount = byKey.primary || 0;
  const backupCount = byKey.backup || 0;
  const fieldscanPrimaryCount = byKey.fieldscan_primary || 0;
  const fieldscanBackupCount = byKey.fieldscan_backup || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Usage Analytics</h1>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">Today</h2>
          <p className="text-3xl font-bold text-emerald-500">{total?.today || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">requests today</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">All Time</h2>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{total?.total || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">total requests</p>
        </Card>
      </div>

      {/* Breakdown by Endpoint */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">💬 Chat</h2>
          <p className="text-2xl font-bold text-blue-500">{chatCount}</p>
          <p className="text-xs text-[var(--text-muted)]">requests today</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">📸 Crop Analysis</h2>
          <p className="text-2xl font-bold text-purple-500">{cropCount}</p>
          <p className="text-xs text-[var(--text-muted)]">requests today</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">🌾 Field Scan</h2>
          <p className="text-2xl font-bold text-emerald-500">{fieldScanCount}</p>
          <p className="text-xs text-[var(--text-muted)]">scans today</p>
        </Card>
      </div>

      {/* Breakdown by Key */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Gemini Key Usage Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Crop & Chat Keys</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Primary Key</span>
                <span className="text-[var(--text-primary)] font-bold">{primaryCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Backup Key</span>
                <span className="text-[var(--text-primary)] font-bold">{backupCount}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total</span>
                  <span className="text-[var(--text-primary)] font-bold">{primaryCount + backupCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Field Scan Keys</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Primary Key</span>
                <span className="text-[var(--text-primary)] font-bold">{fieldscanPrimaryCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Backup Key</span>
                <span className="text-[var(--text-primary)] font-bold">{fieldscanBackupCount}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total</span>
                  <span className="text-[var(--text-primary)] font-bold">{fieldscanPrimaryCount + fieldscanBackupCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Farms Today */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Top Farms Today</h2>
        {farms.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No usage data.</p>
        ) : (
          <div className="space-y-3">
            {farms.map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-primary)]">{f.farm?.name || f.name || 'Unknown'}</span>
                  <span className="text-[var(--text-muted)]">
                    {f.farm?.owner?.name ? `${f.farm.owner.name} · ` : ''}
                    {f.usage?.today || 0} today / {f.usage?.total || 0} total
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${((f.usage?.today || 0) / maxRequests) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* User Lookup */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Lookup</h2>
        <div className="flex gap-2 mb-4">
          <Input value={userLookup} onChange={e => setUserLookup(e.target.value)} placeholder="User ID or email..." className="flex-1" />
          <Button onClick={handleUserLookup} loading={lookupLoading}><HiSearch className="w-4 h-4 mr-1" /> Lookup</Button>
        </div>
        {userUsage && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">User</span>
              <span className="text-[var(--text-primary)]">{userUsage.user?.name || userUsage.user?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Today</span>
              <span className="text-[var(--text-primary)] font-bold">{userUsage.usage?.today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total</span>
              <span className="text-[var(--text-primary)]">{userUsage.usage?.total || 0}</span>
            </div>
            {userUsage.history?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)] mb-2">Recent Activity</p>
                {userUsage.history.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex justify-between text-xs py-2 border-b border-[var(--border-color)] last:border-0">
                    <div>
                      <span className="text-[var(--text-primary)] font-medium">
                        {h.endpoint === 'chat' ? '💬 Chat' : h.endpoint === 'crop_analysis' ? '📸 Crop' : h.endpoint === 'field_scan' ? '🌾 Field Scan' : h.endpoint}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2">
                        {h.keyUsed === 'primary' ? 'Primary' : h.keyUsed === 'backup' ? 'Backup' : h.keyUsed === 'fieldscan_primary' ? 'FS Primary' : h.keyUsed === 'fieldscan_backup' ? 'FS Backup' : h.keyUsed || '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-muted)]">
                        {new Date(h.requestTimestamp).toLocaleTimeString()}
                      </span>
                      {h.endpoint === 'field_scan' && h.metadata && (
                        <div className="text-[var(--text-muted)] text-xs mt-1">
                          📸 {h.metadata.totalFrames || 0} total | 🔍 {h.tokensUsed || 0} analyzed | ⏭️ {h.metadata.skippedFrames || 0} skipped | 🤖 {h.metadata.geminiRequests || 0} reqs
                          {h.metadata.duration ? ` | ⏱ ${h.metadata.duration}s` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}