import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClient, updateClient, suspendClient, activateClient, deleteClient } from '../../services/smartpos/clients';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Spinner from '../../components/smartpos/ui/Spinner';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiArrowLeft, HiKey, HiEye, HiEyeOff, HiClipboardCopy } from 'react-icons/hi';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchClient = () => {
    setLoading(true);
    getClient(id)
      .then(res => { setClient(res.client); setForm(res.client); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClient(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateClient(id, form); setEditing(false); fetchClient(); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendClient(id);
      else if (confirm.type === 'activate') await activateClient(id);
      else await deleteClient(id);
      if (confirm.type === 'delete') navigate('/smartpos/clients');
      else fetchClient();
      setConfirm({ open: false, type: '' });
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const copyLicenseKey = () => {
    if (client?.licenseKey) { navigator.clipboard.writeText(client.licenseKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!client) return null;

  const statusVariant = { active: 'success', inactive: 'default', suspended: 'danger' };

  return (
    <div>
      <button onClick={() => navigate('/smartpos/clients')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"><HiArrowLeft /> Back to Clients</button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{client.businessName || 'Client Details'}</h1>
        <div className="flex gap-2">
          {!editing && <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>}
          {editing && <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>}
          {client.status === 'active' && <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}>Suspend</Button>}
          {client.status === 'suspended' && <Button variant="success" onClick={() => setConfirm({ open: true, type: 'activate' })}>Activate</Button>}
          <Button variant="danger" onClick={() => setConfirm({ open: true, type: 'delete' })}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.licenseKey && (
          <Card className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><HiKey className="w-5 h-5 text-blue-600" /></div>
              <div><h2 className="font-semibold text-[var(--text-primary)]">License Key</h2><p className="text-xs text-[var(--text-muted)]">Unique key for this client</p></div>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-[var(--bg-tertiary)] px-4 py-2 rounded text-sm select-all break-all">{showKey ? client.licenseKey : '••••••••••••••••••••••••'}</code>
              <button onClick={() => setShowKey(!showKey)} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)]">{showKey ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}</button>
              <button onClick={copyLicenseKey} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)]"><HiClipboardCopy className="w-5 h-5" /></button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
          </Card>
        )}

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">General Info</h2>
          {editing ? (
            <div className="space-y-3">
              <Input label="Business Name" value={form.businessName || ''} onChange={(e) => setForm(p => ({ ...p, businessName: e.target.value }))} />
              <Input label="Owner Name" value={form.ownerName || ''} onChange={(e) => setForm(p => ({ ...p, ownerName: e.target.value }))} />
              <Input label="Email" value={form.email || ''} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
              <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              <Input label="Currency" value={form.currency || ''} onChange={(e) => setForm(p => ({ ...p, currency: e.target.value }))} />
              <Button onClick={handleSave} loading={saving}>Save</Button>
            </div>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Owner:</dt><dd className="text-[var(--text-primary)]">{client.ownerName || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{client.email || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{client.phone || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Currency:</dt><dd className="text-[var(--text-primary)]">{client.currency}</dd></div>
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Subscription</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Plan:</dt><dd><Badge variant="blue">{client.plan || 'N/A'}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusVariant[client.status]}>{client.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Expires:</dt><dd className="text-[var(--text-primary)]">{client.subscriptionExpiry ? formatDate(client.subscriptionExpiry) : 'Never'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Created:</dt><dd className="text-[var(--text-primary)]">{formatDate(client.createdAt, 'full')}</dd></div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, type: '' })} title={`${confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'} Client`} message={confirm.type === 'delete' ? 'Permanently delete this client?' : `${confirm.type} this client?`} confirmLabel={confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'} variant={confirm.type === 'delete' ? 'danger' : 'warning'} onConfirm={handleAction} loading={actionLoading} />
    </div>
  );
}