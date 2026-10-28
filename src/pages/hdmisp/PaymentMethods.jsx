import { useEffect, useState } from 'react';
import { HiCog } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Toggle from '../../components/hdmisp/ui/Toggle';
import Modal from '../../components/hdmisp/ui/Modal';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import { getPaymentMethods, updatePaymentMethod } from '../../services/hdmisp/paymentMethods';

export default function PaymentMethods() {
  const toast = useToast();
  const { isSuperadmin } = useAuth();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [draft, setDraft] = useState({ label: '', enabled: false, config: {} });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPaymentMethods();
      setMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (m) => {
    if (!isSuperadmin) return;
    setBusyId(m._id);
    try {
      await updatePaymentMethod(m._id, { enabled: !m.enabled });
      toast.success(`${m.label} ${m.enabled ? 'disabled' : 'enabled'}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setDraft({ label: m.label || '', enabled: m.enabled !== false, config: { ...(m.config || {}) } });
  };

  const patchCfg = (k, v) => setDraft((p) => ({ ...p, config: { ...p.config, [k]: v } }));

  const saveConfig = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updatePaymentMethod(editTarget._id, {
        label: draft.label,
        enabled: draft.enabled,
        config: draft.config,
      });
      toast.success('Saved');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderFields = () => {
    const code = editTarget?.code;
    const c = draft.config;

    switch (code) {
      case 'mpesa_stk':
        return (
          <>
            <Select label="Environment" value={c.env || 'sandbox'} onChange={(e) => patchCfg('env', e.target.value)} options={[{ value: 'sandbox', label: 'Sandbox' }, { value: 'production', label: 'Production' }]} />
            <Input label="Consumer key" value={c.consumerKey || ''} onChange={(e) => patchCfg('consumerKey', e.target.value)} />
            <Input label="Consumer secret" value={c.consumerSecret || ''} onChange={(e) => patchCfg('consumerSecret', e.target.value)} />
            <Input label="Shortcode" value={c.shortcode || ''} onChange={(e) => patchCfg('shortcode', e.target.value)} />
            <Input label="Passkey" value={c.passkey || ''} onChange={(e) => patchCfg('passkey', e.target.value)} />
            <Input label="Callback URL" value={c.callbackUrl || ''} onChange={(e) => patchCfg('callbackUrl', e.target.value)} />
          </>
        );
      case 'mpesa_send':
        return (
          <>
            <Input label="Phone number" value={c.phone || ''} onChange={(e) => patchCfg('phone', e.target.value)} />
            <Input label="Display name" value={c.name || ''} onChange={(e) => patchCfg('name', e.target.value)} />
          </>
        );
      case 'mpesa_till':
        return (
          <>
            <Input label="Till number" value={c.tillNumber || ''} onChange={(e) => patchCfg('tillNumber', e.target.value)} />
            <Input label="Business name" value={c.name || ''} onChange={(e) => patchCfg('name', e.target.value)} />
          </>
        );
      case 'mpesa_paybill':
        return (
          <>
            <Input label="Paybill number" value={c.paybillNumber || ''} onChange={(e) => patchCfg('paybillNumber', e.target.value)} />
            <Input label="Account number" value={c.accountNumber || ''} onChange={(e) => patchCfg('accountNumber', e.target.value)} />
            <Input label="Business name" value={c.name || ''} onChange={(e) => patchCfg('name', e.target.value)} />
          </>
        );
      case 'bank':
        return (
          <>
            <Input label="Bank name" value={c.bankName || ''} onChange={(e) => patchCfg('bankName', e.target.value)} />
            <Input label="Account name" value={c.accountName || ''} onChange={(e) => patchCfg('accountName', e.target.value)} />
            <Input label="Account number" value={c.accountNumber || ''} onChange={(e) => patchCfg('accountNumber', e.target.value)} />
            <Input label="Branch" value={c.branch || ''} onChange={(e) => patchCfg('branch', e.target.value)} />
            <Input label="SWIFT" value={c.swift || ''} onChange={(e) => patchCfg('swift', e.target.value)} />
          </>
        );
      case 'stripe':
        return (
          <>
            <Select label="Mode" value={c.mode || 'test'} onChange={(e) => patchCfg('mode', e.target.value)} options={[{ value: 'test', label: 'Test' }, { value: 'live', label: 'Live' }]} />
            <Input label="Publishable key" value={c.publishableKey || ''} onChange={(e) => patchCfg('publishableKey', e.target.value)} />
            <Input label="Secret key" value={c.secretKey || ''} onChange={(e) => patchCfg('secretKey', e.target.value)} />
            <Input label="Webhook secret" value={c.webhookSecret || ''} onChange={(e) => patchCfg('webhookSecret', e.target.value)} />
          </>
        );
      case 'paypal':
        return (
          <>
            <Select label="Mode" value={c.mode || 'sandbox'} onChange={(e) => patchCfg('mode', e.target.value)} options={[{ value: 'sandbox', label: 'Sandbox' }, { value: 'live', label: 'Live' }]} />
            <Input label="Client ID" value={c.publicKey || ''} onChange={(e) => patchCfg('publicKey', e.target.value)} />
            <Input label="Secret" value={c.secretKey || ''} onChange={(e) => patchCfg('secretKey', e.target.value)} />
          </>
        );
      case 'cash':
        return <p className="text-sm text-[var(--text-muted)]">No configuration needed.</p>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Methods</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Platform-wide methods. Providers enable the ones they use.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <Card key={m._id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-[var(--text-primary)]">{m.label || m.code}</p>
                  <Badge variant="default">{m.mode || 'manual'}</Badge>
                  <Badge variant={m.enabled ? 'success' : 'default'} dot>{m.enabled ? 'On' : 'Off'}</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-mono">{m.code}</p>
              </div>
              {isSuperadmin && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<HiCog className="w-4 h-4" />}
                    onClick={() => openEdit(m)}
                    title="Configure"
                    aria-label={`Configure ${m.label || m.code}`}
                  />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={m.enabled}
                    aria-label={`Toggle ${m.label || m.code}`}
                    title={m.enabled ? 'Disable' : 'Enable'}
                    onClick={() => toggle(m)}
                    disabled={busyId === m._id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      m.enabled ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        m.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {methods.length === 0 && (
          <Card><p className="text-sm text-[var(--text-muted)] py-6 text-center">No payment methods configured</p></Card>
        )}
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Configure ${editTarget?.label || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveConfig} loading={saving}>Save config</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Label" value={draft.label} onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))} />
          <Toggle label="Enabled" checked={draft.enabled} onChange={(v) => setDraft((p) => ({ ...p, enabled: v }))} />
          <div className="border-t border-[var(--border-color)] pt-4 space-y-3">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Config</p>
            {renderFields()}
          </div>
        </div>
      </Modal>
    </div>
  );
}