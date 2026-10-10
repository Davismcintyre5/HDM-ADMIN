import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../services/portfolio/dashboard';
import Card from '../../components/portfolio/ui/Card';
import Badge from '../../components/portfolio/ui/Badge';
import Spinner from '../../components/portfolio/ui/Spinner';
import {
  HiCode,
  HiBriefcase,
  HiClipboardList,
  HiPhotograph,
  HiMail,
  HiArrowRight,
  HiUsers,
  HiDocumentText,
  HiCloud,
  HiDatabase,
  HiServer,
  HiOfficeBuilding,
  HiCog,
} from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data || res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Card className="text-center text-red-500">{error}</Card>;
  }

  const hdm = data?.hdm || {};
  const smartgen = data?.smartgen || {};

  const stats = [
    {
      key: 'apps',
      label: 'Apps',
      icon: HiCode,
      color: 'text-blue-500',
      value: hdm.apps || 0,
      path: '/portfolio/apps',
    },
    {
      key: 'services',
      label: 'Services',
      icon: HiBriefcase,
      color: 'text-emerald-500',
      value: hdm.services || 0,
      path: '/portfolio/services',
    },
    {
      key: 'projects',
      label: 'Projects',
      icon: HiClipboardList,
      color: 'text-violet-500',
      value: hdm.projects || 0,
      path: '/portfolio/projects',
    },
    {
      key: 'photos',
      label: 'Photos',
      icon: HiPhotograph,
      color: 'text-amber-500',
      value: hdm.photos || 0,
      path: '/portfolio/photos',
    },
    {
      key: 'unreadMessages',
      label: 'Unread',
      icon: HiMail,
      color: 'text-rose-500',
      value: hdm.unreadMessages || 0,
      path: '/portfolio/contacts?filter=unread',
    },
  ];

  const secondRow = [
    {
      key: 'totalContacts',
      label: 'Total Messages',
      icon: HiMail,
      color: 'text-rose-500',
      value: hdm.totalContacts || 0,
      path: '/portfolio/contacts',
    },
    {
      key: 'smartgenUsers',
      label: 'SmartGen Users',
      icon: HiUsers,
      color: 'text-sky-500',
      value: smartgen.users || 0,
      path: null,
    },
    {
      key: 'smartgenDocuments',
      label: 'SmartGen Docs',
      icon: HiDocumentText,
      color: 'text-cyan-500',
      value: smartgen.documents || 0,
      path: null,
    },
    {
      key: 'hdmAdmins',
      label: 'Admins',
      icon: HiUsers,
      color: 'text-slate-500',
      value: hdm.hdmAdmins || 0,
      path: null,
    },
  ];

  const quickLinks = [
    {
      label: 'Cloudinary',
      desc: 'Manage media storage',
      icon: HiCloud,
      path: '/portfolio/cloudinary',
      color: 'from-sky-500 to-blue-600',
    },
    {
      label: 'MongoDB',
      desc: 'Database management',
      icon: HiDatabase,
      path: '/portfolio/mongodb',
      color: 'from-emerald-500 to-green-600',
    },
    {
      label: 'Backups',
      desc: 'System backups',
      icon: HiServer,
      path: '/portfolio/backups',
      color: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Company',
      desc: 'Company profile',
      icon: HiOfficeBuilding,
      path: '/portfolio/company',
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Settings',
      desc: 'System settings',
      icon: HiCog,
      path: '/portfolio/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          HDM Portfolio Overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <Card
            key={s.key}
            className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => s.path && navigate(s.path)}
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${s.color.replace(
                'text-',
                'bg-'
              )}`}
            />
            <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {s.value}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {secondRow.map((s) => (
          <Card
            key={s.key}
            className={
              s.path
                ? 'cursor-pointer hover:shadow-md transition-shadow'
                : ''
            }
            onClick={() => s.path && navigate(s.path)}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiArrowRight className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-6 h-6" />
                  <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="font-semibold text-sm">{link.label}</p>
                <p className="text-xs text-white/70 mt-0.5">{link.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}