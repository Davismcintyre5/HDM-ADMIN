import { useState, useEffect } from 'react';
import { getOverview, getContentAnalytics, getCommunityAnalytics } from '../../services/rvnp/analytics';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Spinner from '../../components/rvnp/ui/Spinner';
import StatCard from '../../components/rvnp/ui/StatCard';
import { HiUsers, HiPhotograph, HiUserGroup, HiCash, HiChartBar, HiCollection, HiAcademicCap } from 'react-icons/hi';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [content, setContent] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview(), getContentAnalytics(), getCommunityAnalytics()])
      .then(([o, c, comm]) => {
        setOverview(o.data || o);
        setContent(c.data || c);
        setCommunity(comm.data || comm);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Users" value={overview?.totalUsers || 0} sub={`${overview?.userGrowth || '0%'} growth`} color="text-emerald-500" />
        <StatCard icon={HiUserGroup} label="Active Today" value={overview?.activeToday || 0} color="text-blue-500" />
        <StatCard icon={HiPhotograph} label="Total Posts" value={overview?.totalPosts || 0} sub={`${overview?.postsThisMonth || 0} this month`} color="text-amber-500" />
        <StatCard icon={HiCollection} label="Groups" value={overview?.totalGroups || 0} color="text-cyan-500" />
        <StatCard icon={HiCash} label="Revenue" value={`KES ${(overview?.revenueThisMonth || 0).toLocaleString()}`} sub="this month" color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiChartBar className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Content</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Posts Per Day</p>
              {content?.postsPerDay?.length > 0 ? (
                <div className="space-y-1">
                  {content.postsPerDay.slice(-7).map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">{d._id || d.date}</span>
                      <span className="text-[var(--text-primary)] font-medium">{d.count || 0}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">No post data yet.</p>}
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Top Posts</p>
              {content?.topPosts?.length > 0 ? (
                <div className="space-y-2">
                  {content.topPosts.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-secondary)] rounded">
                      <span className="text-[var(--text-primary)] truncate flex-1">{p.content || p._id}</span>
                      <span className="text-[var(--text-muted)] ml-2">{p.engagement || p.likes || 0} eng.</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">No posts yet.</p>}
            </div>
          </div>
        </Card>

        {/* Community */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiUserGroup className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Community</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Department Breakdown</p>
              {community?.departmentBreakdown?.length > 0 ? (
                <div className="space-y-2">
                  {community.departmentBreakdown.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-[var(--bg-secondary)] rounded">
                      <div className="flex items-center gap-2">
                        <HiAcademicCap className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-primary)] capitalize">{d._id}</span>
                      </div>
                      <Badge variant="info">{d.count} users</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">No department data yet.</p>}
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Top Groups</p>
              {community?.topGroups?.length > 0 ? (
                <div className="space-y-2">
                  {community.topGroups.slice(0, 5).map((g, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-secondary)] rounded">
                      <span className="text-[var(--text-primary)]">{g.name || g._id}</span>
                      <span className="text-[var(--text-muted)]">{g.members || 0} members</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">No groups yet.</p>}
            </div>
          </div>
        </Card>
      </div>

      {/* Listings & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiCollection className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Listings</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{overview?.totalListings || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{overview?.totalGroups || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Groups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{overview?.usersThisMonth || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">New This Month</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiCash className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Revenue</h2>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">KES {(overview?.revenueThisMonth || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">This Month</p>
          </div>
        </Card>
      </div>
    </div>
  );
}