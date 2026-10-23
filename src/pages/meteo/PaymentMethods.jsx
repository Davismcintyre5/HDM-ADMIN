import { useEffect, useState } from 'react';
import { HiCog, HiPlus, HiTrash } from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Toggle from '../../components/meteo/ui/Toggle';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { useAuth } from '../../context/meteo/AuthContext';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
} from '../../services/meteo/paymentMethods';
import {
  PAYMENT_METHOD_CODES,
  PAYMENT_METHOD_MODES,
} from '../../utils/meteo/constants';

export default function PaymentMethods() {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [modal, setModal] = useState({ open: false, mode: 'edit', method: null });
  const [form, setForm] = useState({
    code: 'mpesa_till',
    label: '',
    mode: 'manual',
    enabled: true,
    config: {},
  });
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, method: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaymentMethods();
      const data = res?.data || res;
      setMethods(data?.methods || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm({
      code: 'mpesa_till',
      label: '',
      mode: 'manual',
      enabled: true,
      config: {},
    });
    setModal({ open: true, mode: 'create', method: null });
  };

  const openEdit = (m) => {
    setForm({
      code: m.code || '',
      label: m.label || '',
      mode: m.mode || 'manual',
      enabled: m.enabled !== false,
      config: { ...(m.config || {}) },
    });
    setModal({ open: true, mode: 'edit', method: m });
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const patchConfig = (key, value) =>
    setForm((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('Label is required');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await createPaymentMethod({
          code: form.code,
          label: form.label,
          mode: form.mode,
          enabled: form.enabled,
          config: form.config,
        });
        toast.success('Method created');
      } else {
        await updatePaymentMethod(modal.method._id || modal.method.id, {
          label: form.label,
          mode: form.mode,
          enabled: form.enabled,
          config: form.config,
        });
        toast.success('Method updated');
      }
      setModal({ open: false, mode: 'edit', method: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (m) => {
    const id = m._id || m.id;
    setBusyId(id);
    try {
      await togglePaymentMethod(id);
      toast.success(`${m.label} ${m.enabled ? 'disabled' : 'enabled'}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.method) return;
    const id = confirmDelete.method._id || confirmDelete.method.id;
    setBusyId(id);
    try {
      await deletePaymentMethod(id);
      toast.success('Method deleted');
      setConfirmDelete({ open: false, method: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const renderConfigFields = () => {
    switch (form.code) {
      case 'mpesa_till':
        return (
          <>
            <Input
              label="Till number"
              value={form.config.tillNumber || ''}
              onChange={(e) => patchConfig('tillNumber', e.target.value)}
            />
            <Input
              label="Business name"
              value={form.config.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );
      case 'mpesa_paybill':
        return (
          <>
            <Input
              label="Paybill number"
              value={form.config.paybillNumber || ''}
              onChange={(e) => patchConfig('paybillNumber', e.target.value)}
            />
            <Input
              label="Account number"
              value={form.config.accountNumber || ''}
              onChange={(e) => patchConfig('accountNumber', e.target.value)}
            />
            <Input
              label="Business name"
              value={form.config.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );
      case 'mpesa_send':
        return (
          <>
            <Input
              label="Receiving phone"
              value={form.config.phone || ''}
              onChange={(e) => patchConfig('phone', e.target.value)}
            />
            <Input
              label="Display name"
              value={form.config.name || ''}
              onChange={(e) => patchConfig('name', e.target.value)}
            />
          </>
        );
      case 'bank':
        return (
          <>
            <Input
              label="Bank name"
              value={form.config.bankName || ''}
              onChange={(e) => patchConfig('bankName', e.target.value)}
            />
            <Input
              label="Account name"
              value={form.config.accountName || ''}
              onChange={(e) => patchConfig('accountName', e.target.value)}
            />
            <Input
              label="Account number"
              value={form.config.accountNumber || ''}
              onChange={(e) => patchConfig('accountNumber', e.target.value)}
            />
          </>
        );
      case 'stripe':
        return (
          <p className="text-xs text-[var(--text-muted)]">
            Stripe credentials are managed on the server.
          </p>
        );
      case 'mpesa_stk':
        return (
          <p className="text-xs text-[var(--text-muted)]">
            M-Pesa STK credentials are managed on the server.
          </p>
        );
      case 'cash':
        return (
          <p className="text-xs text-[var(--text-muted)]">
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Payment methods
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {methods.length} methods configured
          </p>
        </div>
        {isSuperAdmin && (
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New method
          </Button>
        )}
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
                      {m.label}
                    </p>
                    <Badge variant={m.mode === 'auto' ? 'info' : 'default'}>
                      {m.mode}
                    </Badge>
                    <Badge variant={m.enabled ? 'success' : 'default'} dot>
                      {m.enabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    {m.code}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSuperAdmin && (
                    <>
                      <button
                        onClick={() => openEdit(m)}
                        className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                        type="button"
                        title="Edit"
                      >
                        <HiCog className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ open: true, method: m })}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                        type="button"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleToggle(m)}
                    disabled={busyId === id || !isSuperAdmin}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
                      m.enabled ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
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
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'edit', method: null })}
        title={modal.mode === 'create' ? 'Create payment method' : `Edit ${modal.method?.label || ''}`}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, mode: 'edit', method: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {modal.mode === 'create' && (
            <Select
              label="Code"
              value={form.code}
              onChange={(e) => patch('code', e.target.value)}
              options={PAYMENT_METHOD_CODES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          )}
          <Input
            label="Label *"
            value={form.label}
            onChange={(e) => patch('label', e.target.value)}
          />
          <Select
            label="Mode"
            value={form.mode}
            onChange={(e) => patch('mode', e.target.value)}
            options={PAYMENT_METHOD_MODES}
          />
          <Toggle
            label="Enabled"
            checked={form.enabled}
            onChange={(v) => patch('enabled', v)}
          />
          <div className="border-t border-[var(--border-color)] pt-4">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Config
            </p>
            <div className="space-y-3">{renderConfigFields()}</div>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, method: null })}
        title="Delete method"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete({ open: false, method: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={!!busyId}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Delete <strong>{confirmDelete.method?.label}</strong>? You must disable
          it first.
        </p>
      </Modal>
    </div>
  );
}