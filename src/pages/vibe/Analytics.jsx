import { useEffect, useState } from 'react';
import { getUserGrowth, getPostActivity, getTopPosts, getRevenue } from '../../services/vibe/dashboard';
import Card from '../../components/vibe/ui/Card';
import Spinner from '../../components/vibe/ui/Spinner';
import Badge from '../../components/vibe/ui/Badge';

export default function Analytics() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [postActivity, setPostActivity] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getUserGrowth(30),
      getPostActivity(30),
      getTopPosts(10),
      getRevenue(),
    ])
      .then(([u, p, t, r]) => {
        setUserGrowth(u.data || u || []);
        setPostActivity(p.data || p || []);
        setTopPosts(t.data || t || []);
        setRevenue(r.data || r || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const maxUserGrowth = Math.max(...userGrowth.map(d => d.count || 0), 1);
  const maxPostActivity = Math.max(...postActivity.map(d => d.count || 0), 1);
  const totalRevenue = revenue.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Growth (30 Days)</h2>
          {userGrowth.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-1">
              {userGrowth.map((d) => (
                <div key={d._id} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] w-24">{d._id}</span>
                  <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-5 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${(d.count / maxUserGrowth) * 100}%` }}
                    >
                      {d.count > 0 && <span className="text-[10px] text-white font-medium">{d.count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Post Activity Chart */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Post Activity (30 Days)</h2>
          {postActivity.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-1">
              {postActivity.map((d) => (
                <div key={d._id} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] w-24">{d._id}</span>
                  <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-5 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${(d.count / maxPostActivity) * 100}%` }}
                    >
                      {d.count > 0 && <span className="text-[10px] text-white font-medium">{d.count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Top Posts</h2>
          {topPosts.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8 text-center">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {topPosts.map((post, i) => (
                <div key={post._id || i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-purple-500">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                        {post.content || post.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        by {post.author?.username || post.author?.email || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="gradient">{post.engagementScore || 0} pts</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Revenue */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Revenue</h2>
          <div className="text-center mb-6">
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Total Revenue</p>
          </div>
          {revenue.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center">No revenue data yet</p>
          ) : (
            <div className="space-y-2">
              {revenue.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="text-sm text-[var(--text-primary)] capitalize">{r._id}</span>
                  <div className="text-sm">
                    <span className="font-medium text-[var(--text-primary)]">${r.total?.toLocaleString()}</span>
                    <span className="text-[var(--text-muted)] ml-2">({r.count} sales)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}