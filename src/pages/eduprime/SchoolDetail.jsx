import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchool, updateSchool, suspendSchool, reactivateSchool } from '../../services/eduprime/schools';
import { getCountries, getCounties, getConstituencies } from '../../services/eduprime/reference';
import Card from '../../components/eduprime/ui/Card';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Spinner from '../../components/eduprime/ui/Spinner';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({});
  const [countries, setCountries] = useState([]);
  const [counties, setCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);

  useEffect(() => {
    getCountries().then(res => setCountries(res.data || [])).catch(console.error);
    getCounties('KE').then(res => setCounties(res.data || [])).catch(console.error);
  }, []);

  const fetchSchool = () => {
    getSchool(id)
      .then(res => {
        const s = res.data || res;
        setSchool(s);
        setForm(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchool(); }, [id]);

  useEffect(() => {
    if (school?.county && counties.length > 0) {
      const countyCode = counties.find(c => c.name === school.county)?.code || school.county;
      getConstituencies(countyCode)
        .then(res => setConstituencies(res.data || []))
        .catch(console.error);
    }
  }, [school?.county, counties]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateSchool(id, form); alert('School updated!'); fetchSchool(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setSaving(false);
  };

  const handleSuspend = async () => {
    if (!window.confirm('Suspend this school? Students and staff will lose access.')) return;
    setActionLoading(true);
    try { await suspendSchool(id); fetchSchool(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try { await reactivateSchool(id); fetchSchool(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const resolveCountry = (code) => {
    if (!code) return '—';
    const c = countries.find(x => x.code === code);
    return c?.name || code;
  };

  const resolveCounty = (code) => {
    if (!code) return '—';
    const c = counties.find(x => x.code === code);
    return c?.name || code;
  };

  const resolveConstituency = (code) => {
    if (!code) return '—';
    const c = constituencies.find(x => x.code === code);
    return c?.name || code;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!school) return <div className="text-center py-20 text-[var(--text-muted)]">School not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/eduprime/schools')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{school.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{school.adminEmail}</p>
          </div>
          <Badge variant={school.isActive ? 'success' : 'danger'}>{school.isActive ? 'Active' : 'Suspended'}</Badge>
        </div>
        <div className="flex gap-2">
          {school.isActive ? (
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend School</Button>
          ) : (
            <Button variant="success" onClick={handleReactivate} loading={actionLoading}>Reactivate School</Button>
          )}
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">School Information</h2>
          <div className="space-y-4">
            <Input label="School Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country" value={resolveCountry(form.country)} onChange={e => setForm({ ...form, country: e.target.value })} />
              <Input label="County" value={resolveCounty(form.county)} onChange={e => setForm({ ...form, county: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Constituency" value={resolveConstituency(form.constituency)} onChange={e => setForm({ ...form, constituency: e.target.value })} />
              <Input label="Town" value={form.town || ''} onChange={e => setForm({ ...form, town: e.target.value })} />
            </div>
            <Input label="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input label="Levels" value={form.levels?.join(', ') || ''} onChange={e => setForm({ ...form, levels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Details</h2>
          <div className="space-y-3 text-sm">
            <Row label="Type" value={school.type} />
            <Row label="Currency" value={school.currency} />
            <Row label="Students" value={school.studentCount} />
            <Row label="Staff" value={school.staffCount} />
            <Row label="Admin Name" value={school.adminName} />
            <Row label="Admin Email" value={school.adminEmail} />
            <Row label="Admin Phone" value={school.adminPhone} />
            <Row label="Created" value={formatDate(school.createdAt, 'full')} />
            {school.suspendedAt && <Row label="Suspended At" value={formatDate(school.suspendedAt, 'full')} />}
            {school.suspensionReason && <Row label="Suspension Reason" value={school.suspensionReason} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="text-[var(--text-primary)]">{value != null ? value : '—'}</span>
    </div>
  );
}