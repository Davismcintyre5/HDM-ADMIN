import { useState, useEffect } from 'react';
import { getPaymentMethods, updatePaymentMethod, togglePaymentMethod, testPaymentMethod } from '../../services/smartpos/paymentMethods';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Toggle from '../../components/smartpos/ui/Toggle';
import Modal from '../../components/smartpos/ui/Modal';
import Spinner from '../../components/smartpos/ui/Spinner';
import { HiPencil, HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, method: null });
  const [form, setForm] = useState({ enabled: true, config: {} });
  const [testResult, setTestResult] = useState({});

  const fetchMethods = () => {
    setLoading(true);
    getPaymentMethods()
      .then(res => setMethods(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMethods(); }, []);

  const openEdit = (m) => {
    setForm({ enabled: m.enabled !== false, config: m.config || {} });
    setModal({ open: true, method: m });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      await updatePaymentMethod(modal.method._id || modal.method.id, form);
      setModal({ open: false, method: null });
      fetchMethods();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => {
    setActionLoading(true);
    try {
      await togglePaymentMethod(id);
      setTestResult(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchMethods();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleTest = async (id) => {
    setActionLoading(true);
    try {
      const res = await testPaymentMethod(id);
      const status = res?.data?.status || res?.status;
      setTestResult(prev => ({ ...prev, [id]: status }));
    } catch (err) {
      setTestResult(prev => ({ ...prev, [id]: 'error' }));
    }
    setActionLoading(false);
  };

  const setConfig = (key, value) =>
    setForm(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));

  const selectClass = 'w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]';

  const renderConfigFields = (id) => {
    switch (id) {
      case 'mpesa_paybill':
        return (
          <div className="space-y-3">
            <Input
              label="Business Number"
              value={form.config.businessNumber || ''}
              onChange={e => setConfig('businessNumber', e.target.value)}
              placeholder="247247"
            />
            <Input
              label="Account Prefix"
              value={form.config.accountPrefix || ''}
              onChange={e => setConfig('accountPrefix', e.target.value)}
              placeholder="SMART-"
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select
                value={form.config.mode || 'auto'}
                onChange={e => setConfig('mode', e.target.value)}
                className={selectClass}
              >
                <option value="auto">Auto (C2B callback)</option>
                <option value="manual">Manual (admin verifies)</option>
              </select>
            </div>
          </div>
        );

      case 'mpesa_send':
        return (
          <div className="space-y-3">
            <Input
              label="Receiving Phone"
              value={form.config.receivingPhone || ''}
              onChange={e => setConfig('receivingPhone', e.target.value)}
              placeholder="0712345678"
            />
            <Input
              label="Receiving Name"
              value={form.config.receivingName || ''}
              onChange={e => setConfig('receivingName', e.target.value)}
              placeholder="SmartPOS Ltd"
            />
          </div>
        );

      case 'mpesa_till':
        return (
          <div className="space-y-3">
            <Input
              label="Till Number"
              value={form.config.tillNumber || ''}
              onChange={e => setConfig('tillNumber', e.target.value)}
              placeholder="5123456"
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select
                value={form.config.mode || 'auto'}
                onChange={e => setConfig('mode', e.target.value)}
                className={selectClass}
              >
                <option value="auto">Auto (C2B callback)</option>
                <option value="manual">Manual (admin verifies)</option>
              </select>
            </div>
          </div>
        );

      case 'mpesa_stk':
        return (
          <p className="text-sm text-[var(--text-muted)]">
            Credentials (Daraja consumer key, secret, passkey, shortcode) are configured on the server via environment variables.
          </p>
        );

      case 'stripe':
        return (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
            <select
              value={form.config.mode || 'test'}
              onChange={e => setConfig('mode', e.target.value)}
              className={selectClass}
            >
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>
          </div>
        );

      case 'paypal':
        return (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
            <select
              value={form.config.mode || 'sandbox'}
              onChange={e => setConfig('mode', e.target.value)}
              className={selectClass}
            >
              <option value="sandbox">Sandbox</option>
              <option value="live">Live</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Methods</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map(m => {
          const id = m._id || m.id;
          return (
            <Card key={id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--text-primary)]">{m.name || id}</h3>
                <Badge variant={m.enabled ? 'success' : 'danger'}>
                  {m.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-3 capitalize">
                {m.provider} · {m.type}
              </p>

              {testResult[id] && (
                <div className="mb-3 flex items-center gap-1 text-xs">
                  {testResult[id] === 'connected'
                    ? <HiCheckCircle className="w-3 h-3 text-green-500" />
                    : <HiXCircle className="w-3 h-3 text-red-500" />}
                  <span className="text-[var(--text-muted)]">Test: {testResult[id]}</span>
                </div>
              )}

              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                  <HiPencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleToggle(id)}>
                  {m.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="info" onClick={() => handleTest(id)} loading={actionLoading}>
                  Test
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, method: null })}
        title={`Edit ${modal.method?.name || modal.method?._id || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <Toggle
            label="Enabled"
            checked={form.enabled}
            onChange={v => setForm({ ...form, enabled: v })}
          />

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Configuration</h3>
            {renderConfigFields(modal.method?._id || modal.method?.id)}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, method: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}