import { useState, useEffect } from 'react';
import Card from '../../components/rvnp/ui/Card';
import Spinner from '../../components/rvnp/ui/Spinner';
import StatCard from '../../components/rvnp/ui/StatCard';
import Avatar from '../../components/rvnp/ui/Avatar';
import {
  HiUsers,
  HiPhotograph,
  HiHeart,
  HiChartBar,
} from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState('contributors');

  useEffect(() => {
    fetchAllData();
  }, []);

  const getToken = () => {
    return localStorage.getItem('rvnp_token') || localStorage.getItem('accessToken');
  };

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, contributorsRes, fansRes] = await Promise.all([
        fetch(`${API_URL}/admin/analytics/full`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/leaderboard/contributors?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/leaderboard/fans?limit=10`, { headers }).then(r => r.json()),
      ]);

      setData({
        ...(analyticsRes?.data || analyticsRes || {}),
        topContributors: Array.isArray(contributorsRes?.data) ? contributorsRes.data : [],
        topFans: Array.isArray(fansRes?.data) ? fansRes.data : [],
      });
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const d = data || {};

  const totalUsers = d.userGrowth?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const totalPosts = d.postGrowth?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const totalEngagement =
    (d.engagement?.totalLikes || 0) +
    (d.engagement?.totalComments || 0) +
    (d.engagement?.totalShares || 0);
  const activeUsers = d.activeUsers?.length || 0;

  const topContributors = d.topContributors || [];
  const topFans = d.topFans || [];
  const popularPosts = d.popularPosts || [];

  const getPostText = (post) => {
    if (!post) return 'No content';
    const content = post.content;
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content.text || content.caption || 'Media post';
    }
    return post.caption || 'No content';
  };

  const getPostEngagement = (post) => {
    return (post?.likeCount || 0) + (post?.commentCount || 0) + (post?.shareCount || 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiUsers} label="Users" value={totalUsers} color="text-emerald-500" />
        <StatCard icon={HiPhotograph} label="Posts" value={totalPosts} color="text-blue-500" />
        <StatCard icon={HiHeart} label="Engagement" value={totalEngagement} color="text-rose-500" />
        <StatCard icon={HiChartBar} label="Active Users" value={activeUsers} color="text-amber-500" />
      </div>

      {/* Leaderboard */}
      <Card>
        <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveLeaderboard('contributors')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeLeaderboard === 'contributors'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            🏆 Top Contributors
          </button>
          <button
            onClick={() => setActiveLeaderboard('fans')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeLeaderboard === 'fans'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            💎 Top Fans
          </button>
        </div>

        {activeLeaderboard === 'contributors' ? (
          topContributors.length > 0 ? (
            <div className="space-y-2">
              {topContributors.map((user, i) => (
                <div key={user.id || i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold w-8 shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.fullName}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {user._count?.posts || 0} posts
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 shrink-0 ml-2 font-medium">
                    {user.contributionScore || 0} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No contributors yet.</p>
          )
        ) : topFans.length > 0 ? (
          <div className="space-y-2">
            {topFans.map((user, i) => (
              <div key={user.id || i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold w-8 shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.fullName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {user._count?.reactions || 0} reactions
                    </p>
                  </div>
                </div>
                <span className="text-xs text-rose-500 shrink-0 ml-2 font-medium">
                  {user.fanScore || 0} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No fans yet.</p>
        )}
      </Card>

      {/* Active Users */}
      {d.activeUsers && d.activeUsers.length > 0 && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Active Users</h2>
          <div className="space-y-2">
            {d.activeUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.fullName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">
                  {user._count?.posts || 0} posts • {user._count?.followers || 0} followers
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Posts */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Popular Posts</h2>
        {popularPosts.length > 0 ? (
          <div className="space-y-2">
            {popularPosts.map((post, i) => (
              <div key={post.id || i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-6 shrink-0">#{i + 1}</span>
                  <p className="text-sm text-[var(--text-primary)] truncate">{getPostText(post)}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">
                  {getPostEngagement(post)} engagement
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No posts yet.</p>
        )}
      </Card>
    </div>
  );
}