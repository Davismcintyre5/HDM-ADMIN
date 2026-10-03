import { useEffect, useState } from 'react';
import { HiCog } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Modal from '../../components/pharmasys/ui/Modal';
import Input from '../../components/pharmasys/ui/Input';
import Select from '../../components/pharmasys/ui/Select';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Toggle from '../../components/pharmasys/ui/Toggle';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getPaymentMethods,
  updatePaymentMethod,
} from '../../services/pharmasys/paymentMethods';

export default function PaymentMethods() {
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const [configDraft, setConfigDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaymentMethods();
      const data = res?.data || res;
      setMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (m) => {
    const id = m._id || m.id;
    setBusyId(id);
    try {
      await updatePaymentMethod(id, { enabled: !m.enabled });
      toast.success(`${m.label || id} ${m.enabled ? 'disabled' : 'enabled'}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setConfigDraft({ ...(m.config || {}) });
  };

  const patchConfig = (key, value) =>
    setConfigDraft((prev) => ({ ...prev, [key]: value }));

  const saveConfig = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updatePaymentMethod(editTarget._id || editTarget.id, {
        config: configDraft,
      });
      toast.success('Config saved');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigFields = () => {
    if (!editTarget) return null;
    const c = configDraft;
    const code = editTarget.code || editTarget._id;

    switch (code) {
      case 'stripe':
        return (
          <>
            <Input
              label="Publishable key"
              value={c.publishableKey || ''}
              onChange={(e) => patchConfig('publishableKey', e.target.value)}
              placeholder="pk_live_..."
            />
            <p className="text-xs text-[var(--text-muted)]">
              Secret keys are managed server-side. Only the publishable key is
              editable here.
            </p>
          </>
        );

      case 'mpesa_stk':
        return (
          <>
            <Input
              label="Shortcode"
              value={c.shortcode || ''}
              onChange={(e) => patchConfig('shortcode', e.target.value)}
              placeholder="174379"
            />
            <Input
              label="Display name"
              value={c.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
              placeholder="PharmaSys"
            />
          </>
        );

      case 'mpesa_till':
        return (
          <>
            <Input
              label="Till number"
              hint="Buy Goods number"
              value={c.tillNumber || ''}
              onChange={(e) => patchConfig('tillNumber', e.target.value)}
            />
            <Input
              label="Business name"
              value={c.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );

      case 'mpesa_paybill':
        return (
          <>
            <Input
              label="Paybill number"
              value={c.paybillNumber || ''}
              onChange={(e) => patchConfig('paybillNumber', e.target.value)}
            />
            <Input
              label="Account number"
              hint="Account the tenant pays into"
              value={c.accountNumber || ''}
              onChange={(e) => patchConfig('accountNumber', e.target.value)}
            />
            <Input
              label="Business name"
              value={c.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );

      case 'mpesa_send':
        return (
          <>
            <Input
              label="Receiving phone"
              hint="Safaricom number, e.g. 254712345678"
              value={c.phone || ''}
              onChange={(e) => patchConfig('phone', e.target.value)}
            />
            <Input
              label="Display name"
              value={c.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );

      case 'bank':
        return (
          <>
            <Input
              label="Bank name"
              value={c.bankName || ''}
              onChange={(e) => patchConfig('bankName', e.target.value)}
            />
            <Input
              label="Account name"
              value={c.accountName || ''}
              onChange={(e) => patchConfig('accountName', e.target.value)}
            />
            <Input
              label="Account number"
              value={c.accountNumber || ''}
              onChange={(e) => patchConfig('accountNumber', e.target.value)}
            />
            <Input
              label="Branch"
              value={c.branch || ''}
              onChange={(e) => patchConfig('branch', e.target.value)}
            />
            <Input
              label="SWIFT code"
              value={c.swift || ''}
              onChange={(e) => patchConfig('swift', e.target.value)}
            />
          </>
        );

      case 'cash':
        return (
          <p className="text-sm text-[var(--text-muted)]">
            No configuration needed.
          </p>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Payment methods
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Platform-wide methods. Tenants enable the ones they use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => {
          const id = m._id || m.id;
          return (
            <Card key={id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-[var(--text-primary)]">
                      {m.label || id}
                    </p>
                    <Badge variant={m.mode === 'auto' ? 'info' : 'default'}>
                      {m.mode}
                    </Badge>
                    <Badge variant={m.enabled ? 'success' : 'default'} dot>
                      {m.enabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {m.code || id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                    type="button"
                    title="Configure"
                  >
                    <HiCog className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggle(m)}
                    disabled={busyId === id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
                      m.enabled ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    type="button"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        m.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Configure ${editTarget?.label || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveConfig} loading={saving}>
              Save config
            </Button>
          </>
        }
      >
        <div className="space-y-4">{renderConfigFields()}</div>
      </Modal>
    </div>
  );
}