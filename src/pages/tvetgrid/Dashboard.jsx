import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers,
  HiBookOpen,
  HiVideoCamera,
  HiClipboardList,
  HiArrowRight,
  HiRefresh,
  HiChartBar,
  HiUserGroup,
  HiDocumentText,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Button from '../../components/tvetgrid/ui/Button';
import Badge from '../../components/tvetgrid/ui/Badge';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import StatCard from '../../components/tvetgrid/ui/StatCard';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getUsers } from '../../services/tvetgrid/users';
import { getCourses } from '../../services/tvetgrid/courses';
import { getLessons } from '../../services/tvetgrid/lessons';
import { getPapers } from '../../services/tvetgrid/papers';
import { getMeetings } from '../../services/tvetgrid/meetings';
import { getAttemptsAnalytics } from '../../services/tvetgrid/analytics';
import { relativeTime } from '../../utils/tvetgrid/formatDate';
import { statusVariant, statusLabel } from '../../utils/tvetgrid/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0,
    papers: 0,
    meetingsLive: 0,
    meetingsTotal: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [attempts30d, setAttempts30d] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, lessonsRes, papersRes, meetingsRes, attemptsRes] =
        await Promise.all([
          getUsers({ limit: 5 }).catch(() => ({ data: [], meta: { total: 0 } })),
          getCourses({ limit: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
          getLessons({ limit: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
          getPapers({ limit: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
          getMeetings({ limit: 100 }).catch(() => ({ data: [], meta: { total: 0 } })),
          getAttemptsAnalytics({}).catch(() => ({ last30Days: 0 })),
        ]);

      const meetings = meetingsRes?.data || [];
      setStats({
        users: usersRes?.meta?.total ?? 0,
        courses: coursesRes?.meta?.total ?? 0,
        lessons: lessonsRes?.meta?.total ?? 0,
        papers: papersRes?.meta?.total ?? 0,
        meetingsLive: meetings.filter((m) => m.status === 'live').length,
        meetingsTotal: meetingsRes?.meta?.total ?? meetings.length,
      });
      setRecentUsers(usersRes?.data || []);
      setAttempts30d(attemptsRes?.last30Days ?? 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const quickLinks = [
    { label: 'Users', path: '/tvetgrid/users', icon: HiUsers, color: 'from-indigo-500 to-blue-600' },
    { label: 'Courses', path: '/tvetgrid/courses', icon: HiBookOpen, color: 'from-emerald-500 to-green-600' },
    { label: 'Lessons', path: '/tvetgrid/lessons', icon: HiVideoCamera, color: 'from-violet-500 to-purple-600' },
    { label: 'Notes', path: '/tvetgrid/notes', icon: HiDocumentText, color: 'from-amber-500 to-orange-600' },
    { label: 'Papers', path: '/tvetgrid/papers', icon: HiClipboardList, color: 'from-sky-500 to-cyan-600' },
    { label: 'Meetings', path: '/tvetgrid/meetings', icon: HiUserGroup, color: 'from-rose-500 to-pink-600' },
    { label: 'Analytics', path: '/tvetgrid/analytics', icon: HiChartBar, color: 'from-teal-500 to-emerald-600' },
    { label: 'Backup', path: '/tvetgrid/backup', icon: HiRefresh, color: 'from-slate-500 to-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            TVETGrid platform overview
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={stats.users}
          hint="All roles"
          icon={HiUsers}
          color="text-indigo-500"
        />
        <StatCard
          label="Courses"
          value={stats.courses}
          hint="Active catalog"
          icon={HiBookOpen}
          color="text-emerald-500"
        />
        <StatCard
          label="Lessons"
          value={stats.lessons}
          hint="Across all courses"
          icon={HiVideoCamera}
          color="text-violet-500"
        />
        <StatCard
          label="Papers"
          value={stats.papers}
          hint="Exam papers"
          icon={HiClipboardList}
          color="text-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Attempts (last 30 days)"
          value={attempts30d.toLocaleString()}
          hint="Practice questions answered"
          icon={HiChartBar}
          color="text-teal-500"
        />
        <StatCard
          label="Meetings"
          value={stats.meetingsLive}
          hint={`${stats.meetingsTotal} total · ${stats.meetingsLive} live now`}
          icon={HiUserGroup}
          color={stats.meetingsLive > 0 ? 'text-red-500' : 'text-rose-500'}
        />
      </div>

      <Card title="Quick actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r ${link.color} text-white text-sm font-medium hover:shadow-md transition-all group`}
                type="button"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
                <HiArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        title="Recent users"
        description="Latest signups"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/tvetgrid/users')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        }
        padding={false}
      >
        <div className="divide-y divide-[var(--border-color)]">
          {recentUsers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">
              No recent users
            </p>
          ) : (
            recentUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => navigate(`/tvetgrid/users/${u._id}`)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                type="button"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {u.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="info">{statusLabel(u.role)}</Badge>
                  <Badge
                    variant={u.isActive ? 'success' : 'danger'}
                    dot
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)]">
                    {relativeTime(u.createdAt)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}