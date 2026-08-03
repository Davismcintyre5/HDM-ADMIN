import { useState, useEffect } from 'react';
import { getSchools, createSchool, deleteSchool } from '../../services/eduprime/schools';
import { getCountries, getCounties, getConstituencies, getWards } from '../../services/eduprime/reference';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import SearchBar from '../../components/eduprime/ui/SearchBar';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Modal from '../../components/eduprime/ui/Modal';
import ConfirmDialog from '../../components/eduprime/ui/ConfirmDialog';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiEye, HiPlus } from 'react-icons/hi';

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: '', country: 'Kenya', county: '', constituency: '', ward: '',
    town: '', location: '', currency: 'KES', type: 'private', levels: [],
    adminName: '', adminEmail: '', adminPhone: '', adminPassword: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const navigate = useNavigate();

  // Reference data for display
  const [countries, setCountries] = useState([]);
  const [allCounties, setAllCounties] = useState([]);
  // Modal cascading
  const [modalCounties, setModalCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  const [countryCode, setCountryCode] = useState('KE');
  const [countyCode, setCountyCode] = useState('');
  const [constituencyCode, setConstituencyCode] = useState('');

  // Load countries and counties for display
  useEffect(() => {
    getCountries().then(res => setCountries(res.data || [])).catch(console.error);
    getCounties('KE').then(res => setAllCounties(res.data || [])).catch(console.error);
  }, []);

  // Modal cascading
  useEffect(() => {
    if (countryCode) {
      getCounties(countryCode).then(res => setModalCounties(res.data || [])).catch(console.error);
      setCountyCode(''); setConstituencies([]); setWards([]);
    }
  }, [countryCode]);

  useEffect(() => {
    if (countyCode) {
      getConstituencies(countyCode).then(res => setConstituencies(res.data || [])).catch(console.error);
      setConstituencyCode(''); setWards([]);
    }
  }, [countyCode]);

  useEffect(() => {
    if (constituencyCode) {
      getWards(constituencyCode).then(res => setWards(res.data || [])).catch(console.error);
    }
  }, [constituencyCode]);

  const fetchSchools = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    getSchools(params)
      .then(res => {
        setSchools(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, [page, search]);

  const resolveCountry = (code) => {
    if (!code) return '—';
    const c = countries.find(x => x.code === code);
    return c?.name || code;
  };

  const resolveCounty = (code) => {
    if (!code) return '—';
    const c = allCounties.find(x => x.code === code);
    return c?.name || code;
  };

  const openCreateModal = () => {
    setForm({
      name: '', country: 'Kenya', county: '', constituency: '', ward: '',
      town: '', location: '', currency: 'KES', type: 'private', levels: [],
      adminName: '', adminEmail: '', adminPhone: '', adminPassword: '',
    });
    setCountryCode('KE'); setCountyCode(''); setConstituencyCode('');
    setModalCounties([]); setConstituencies([]); setWards([]);
    setCreateModal(true);
  };

  const handleCreate = async () => {
    const missing = [];
    if (!form.name) missing.push('School Name');
    if (!form.country) missing.push('Country');
    if (!form.adminEmail) missing.push('Admin Email');
    if (!form.adminPassword) missing.push('Admin Password');
    if (missing.length > 0) { alert(`Required fields missing: ${missing.join(', ')}`); return; }
    setActionLoading(true);
    try { await createSchool(form); setCreateModal(false); fetchSchools(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteSchool(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchSchools(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => navigate(`/eduprime/schools/${row._id}`)} className="text-amber-600 hover:underline font-medium">{row.name}</button>
    )},
    { key: 'country', label: 'Country', render: row => resolveCountry(row.country) },
    { key: 'county', label: 'County', render: row => resolveCounty(row.county) },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type}</Badge> },
    { key: 'adminName', label: 'Admin', render: row => <span className="text-sm">{row.adminName || row.adminEmail || '—'}</span> },
    { key: 'studentCount', label: 'Students', render: row => <span className="text-sm">{row.studentCount != null ? row.studentCount : '—'}</span> },
    { key: 'staffCount', label: 'Staff', render: row => <span className="text-sm">{row.staffCount != null ? row.staffCount : '—'}</span> },
    { key: 'status', label: 'Status', render: row => (
      <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Suspended'}</Badge>
    )},
    { key: 'createdAt', label: 'Created', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/eduprime/schools/${row._id}`)}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.name })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Schools</h1>
        <div className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search schools..." />
          <Button onClick={openCreateModal}><HiPlus className="w-4 h-4 mr-1" /> Add School</Button>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={schools} loading={loading} emptyMessage="No schools found." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create School" size="lg">
        <div className="space-y-4">
          <Input label="School Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Country</label>
            <select value={countryCode} onChange={e => {
              const code = e.target.value; setCountryCode(code);
              const c = countries.find(x => x.code === code);
              setForm(prev => ({ ...prev, country: c?.name || '', currency: c?.currency || 'KES' }));
            }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">County</label>
            <select value={countyCode} onChange={e => {
              const code = e.target.value; setCountyCode(code);
              const c = modalCounties.find(x => x.code === code);
              setForm(prev => ({ ...prev, county: c?.name || '' }));
            }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" disabled={!modalCounties.length}>
              <option value="">Select county</option>
              {modalCounties.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Constituency</label>
            <select value={constituencyCode} onChange={e => {
              const code = e.target.value; setConstituencyCode(code);
              const c = constituencies.find(x => x.code === code);
              setForm(prev => ({ ...prev, constituency: c?.name || '' }));
            }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" disabled={!constituencies.length}>
              <option value="">Select constituency</option>
              {constituencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Ward</label>
            <select value={form.ward || ''} onChange={e => setForm({ ...form, ward: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" disabled={!wards.length}>
              <option value="">Select ward</option>
              {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Town" value={form.town} onChange={e => setForm({ ...form, town: e.target.value })} />
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['KES', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['private', 'public', 'international'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Levels</label>
              <div className="flex gap-3 mt-2">
                {['primary', 'jss', 'sss'].map(l => (
                  <label key={l} className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={(form.levels || []).includes(l)} onChange={() => {
                      const levels = form.levels || [];
                      setForm({ ...form, levels: levels.includes(l) ? levels.filter(x => x !== l) : [...levels, l] });
                    }} className="w-4 h-4 rounded border-[var(--border-color)] text-amber-600" />
                    <span className="text-sm text-[var(--text-primary)] capitalize">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">School Admin Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Admin Name" value={form.adminName || ''} onChange={e => setForm({ ...form, adminName: e.target.value })} />
              <Input label="Admin Email" type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Admin Phone" value={form.adminPhone} onChange={e => setForm({ ...form, adminPhone: e.target.value })} />
              <Input label="Admin Password" type="password" value={form.adminPassword || ''} onChange={e => setForm({ ...form, adminPassword: e.target.value })} placeholder="Min 6 characters" required />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete School" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}