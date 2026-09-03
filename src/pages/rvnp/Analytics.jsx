import { useState, useEffect } from 'react';
import { getFullAnalytics } from '../../services/rvnp/analytics';
import Card from '../../components/rvnp/ui/Card';
import Spinner from '../../components/rvnp/ui/Spinner';
import StatCard from '../../components/rvnp/ui/StatCard';
import { HiUsers, HiPhotograph, HiHeart, HiChartBar } from 'react-icons/hi';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFullAnalytics()
      .then(res => setData(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = data || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Users" value={d.userGrowth?.total || d.totalUsers || 0} color="text-emerald-500" />
        <StatCard icon={HiPhotograph} label="Posts" value={d.postGrowth?.total || d.totalPosts || 0} color="text-blue-500" />
        <StatCard icon={HiHeart} label="Engagement" value={d.engagement?.total || d.totalEngagement || 0} color="text-rose-500" />
        <StatCard icon={HiChartBar} label="Active Users" value={d.activeUsers?.total || d.activeUserCount || 0} color="text-amber-500" />
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Popular Posts</h2>
        {d.popularPosts?.length > 0 ? (
          <div className="space-y-2">
            {d.popularPosts.map((post, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-6">#{i + 1}</span>
                  <p className="text-sm text-[var(--text-primary)] truncate">{post.content || post.caption || post._id}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{post.likes || post.engagement || 0} engagement</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-[var(--text-muted)] text-center py-4">No posts yet.</p>}
      </Card>
    </div>
  );
}