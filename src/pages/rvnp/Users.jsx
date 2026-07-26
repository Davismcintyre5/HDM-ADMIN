import { useState, useEffect } from 'react';
import { getUsers } from '../../services/rvnp/users';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import SearchBar from '../../components/rvnp/ui/SearchBar';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiEye } from 'react-icons/hi';

const STATUS_FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'banned', label: 'Banned' },
];

const CAMPUSES = [
  { value: '', label: 'All Campuses' },
  { value: 'main', label: 'Main Campus' },
  { value: 'kericho_town', label: 'Kericho Town Campus' },
  { value: 'kureisoi', label: 'Kureisoi Campus' },
  { value: 'nakuru_town', label: 'Nakuru Town Campus' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'guest', label: 'Guest' },
];

const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'agriculture', label: 'Agriculture & Environment' },
  { value: 'business', label: 'Business' },
  { value: 'it', label: 'IT' },
  { value: 'creative_arts', label: 'Creative Arts' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const HOSTELS = [
  { value: '', label: 'All Hostels' },
  { value: 'hostel_a', label: 'Hostel A' },
  { value: 'hostel_b', label: 'Hostel B' },
  { value: 'hostel_c', label: 'Hostel C' },
  { value: 'hostel_d', label: 'Hostel D' },
  { value: 'off_campus', label: 'Off Campus' },
];

const statusVariant = { active: 'success', suspended: 'warning', banned: 'danger' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('active');
  const [campusFilter, setCampusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 20, status: filter };
    if (search) params.search = search;
    if (campusFilter) params.campus = campusFilter;
    if (deptFilter) params.department = deptFilter;
    if (hostelFilter) params.hostel = hostelFilter;
    getUsers(params)
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : res.users || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, filter, search, campusFilter, deptFilter, hostelFilter]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: row => (
        <button onClick={() => navigate(`/rvnp/users/${row._id}`)} className="text-emerald-600 hover:underline font-medium">
          {row.firstName} {row.lastName}
        </button>
      ),
    },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || '—'}</span> },
    { key: 'department', label: 'Department', render: row => <span className="capitalize text-sm">{row.department?.replace(/_/g, ' ') || '—'}</span> },
    {
      key: 'campus', label: 'Campus',
      render: row => {
        const campus = CAMPUSES.find(c => c.value === row.campus);
        return <span className="text-sm">{campus?.label || row.campus || '—'}</span>;
      },
    },
    {
      key: 'hostel', label: 'Hostel',
      render: row => {
        const hostel = HOSTELS.find(h => h.value === row.hostel);
        return <span className="text-sm">{hostel?.label || row.hostel?.replace(/_/g, ' ') || '—'}</span>;
      },
    },
    {
      key: 'hdmVerified', label: 'Verified',
      render: row => row.hdmVerified ? <Badge variant="success">Verified</Badge> : <span className="text-[var(--text-muted)] text-sm">—</span>,
    },
    {
      key: 'status', label: 'Status',
      render: row => {
        const status = row.isBanned ? 'banned' : row.isSuspended ? 'suspended' : 'active';
        return <Badge variant={statusVariant[status] || 'default'}>{status}</Badge>;
      },
    },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: '',
      render: row => (
        <Button size="sm" variant="secondary" onClick={() => navigate(`/rvnp/users/${row._id}`)}>
          <HiEye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
        <div className="w-px h-8 bg-[var(--border-color)] mx-1" />
        <select value={campusFilter} onChange={e => { setCampusFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
          {CAMPUSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
          {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={hostelFilter} onChange={e => { setHostelFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
          {HOSTELS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
        </select>
      </div>

      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}