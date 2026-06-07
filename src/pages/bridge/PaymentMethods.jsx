import { useEffect, useState } from 'react';
import { getPaymentMethods, updatePaymentMethod, togglePaymentMethod } from '../../services/bridge/system';
import Card from '../../components/bridge/ui/Card';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Toggle from '../../components/bridge/ui/Toggle';
import Spinner from '../../components/bridge/ui/Spinner';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, method: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchMethods = () => {
    setLoading(true);
    getPaymentMethods()
      .then(res => setMethods(res.methods || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleToggle = async (id) => {
    try { await togglePaymentMethod(id); fetchMethods(); } catch (err) { alert(err.message); }
  };

  const openEdit = (m) => {
    setForm({
      isEnabled: m.isEnabled,
      configuration: m.configuration ? JSON.parse(JSON.stringify(m.configuration)) : {},
    });
    setModal({ open: true, method: m });
  };

  const updateConfig = (key, field, value) => {
    setForm(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: { ...prev.configuration[key], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePaymentMethod(modal.method._id || modal.method.id, form);
      setModal({ open: false, method: null });
      fetchMethods();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

const mpesaSubMethods = [
    { key: 'paybill', label: 'Paybill', fields: [{ key: 'paybillNumber', label: 'Paybill Number', placeholder: '247247' }] },
    { key: 'till', label: 'Till Number', fields: [{ key: 'tillNumber', label: 'Till Number', placeholder: '123456' }] },
    { key: 'stkPush', label: 'STK Push', fields: [{ key: 'shortcode', label: 'Shortcode', placeholder: '174379' }] },
    { key: 'sendMoney', label: 'Send Money', fields: [{ key: 'phoneNumber', label: 'Phone Number', placeholder: '0712345678' }] },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Methods</h1>

      <div className="space-y-4">
        {methods.map(m => (
          <Card key={m._id || m.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{m.name}</h3>
                <p className="text-xs text-[var(--text-muted)] capitalize">{m.type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={m.isEnabled ? 'success' : 'default'}>
                  {m.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Toggle checked={m.isEnabled || false} onChange={() => handleToggle(m._id || m.id)} />
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>Configure</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Configure Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, method: null })}
        title={`Configure ${modal.method?.name || ''}`}
        size="lg"
      >
        {modal.method && (
          <div className="space-y-6">
            <Toggle
              label={`Enable ${modal.method.name}`}
              checked={form.isEnabled || false}
              onChange={(v) => setForm(p => ({ ...p, isEnabled: v }))}
            />

            {/* Stripe / PayPal — keys in .env */}
            {['stripe', 'paypal'].includes(modal.method.slug) && (
              <p className="text-xs text-[var(--text-muted)]">API keys are configured in server .env file.</p>
            )}

            {/* M-Pesa — 4 independent sub-methods */}
            {modal.method.slug === 'mpesa' && form.isEnabled && (
              <div className="space-y-4 ml-4 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700">
                <h4 className="font-medium text-sm text-[var(--text-primary)]">M-Pesa Sub-Methods</h4>
                {mpesaSubMethods.map(sub => (
                  <div key={sub.key} className="p-3 rounded-lg border border-[var(--border-color)] space-y-2">
                    <Toggle
                      label={sub.label}
                      checked={form.configuration?.[sub.key]?.enabled || false}
                      onChange={(v) => updateConfig(sub.key, 'enabled', v)}
                    />
                    {form.configuration?.[sub.key]?.enabled && (
                      <div className="ml-6 space-y-2">
                        {sub.fields.map(f => (
                          <Input
                            key={f.key}
                            label={f.label}
                            value={form.configuration?.[sub.key]?.[f.key] || ''}
                            onChange={(e) => updateConfig(sub.key, f.key, e.target.value)}
                            placeholder={f.placeholder}
                          />
                        ))}
                        <Input
                          label="Passkey"
                          type="password"
                          value={form.configuration?.[sub.key]?.passkey || ''}
                          onChange={(e) => updateConfig(sub.key, 'passkey', e.target.value)}
                          placeholder="bfb279f9a..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bank Transfer */}
            {modal.method.slug === 'bank_transfer' && form.isEnabled && (
              <div className="ml-4 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700 space-y-3">
                <Input label="Bank Name" value={form.configuration?.bankName || ''}
                  onChange={(e) => setForm(p => ({ ...p, configuration: { ...p.configuration, bankName: e.target.value } }))} />
                <Input label="Account Number" value={form.configuration?.accountNumber || ''}
                  onChange={(e) => setForm(p => ({ ...p, configuration: { ...p.configuration, accountNumber: e.target.value } }))} />
                <Input label="Account Name" value={form.configuration?.accountName || ''}
                  onChange={(e) => setForm(p => ({ ...p, configuration: { ...p.configuration, accountName: e.target.value } }))} />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setModal({ open: false, method: null })}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Configuration</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}