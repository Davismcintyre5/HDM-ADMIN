import { useEffect, useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';
import Card from '../../../components/smartpos/ui/Card';
import Spinner from '../../../components/smartpos/ui/Spinner';
import Toggle from '../../../components/smartpos/ui/Toggle';
import { useToast } from '../../../context/smartpos/ToastContext';
import {
  getMpesaConfig,
  updateMpesaConfig,
} from '../../../services/smartpos/settings';

export default function MpesaTab() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMpesaConfig()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res || {};
        setEnabled(data.stkCheckoutEnabled === true);
        setUpdatedAt(data.updatedAt || null);
      })
      .catch((err) => toast.error(err.message || 'Failed to load M-Pesa config'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (next) => {
    setSaving(true);
    try {
      const res = await updateMpesaConfig({ stkCheckoutEnabled: next });
      const data = res?.data || res || {};
      setEnabled(data.stkCheckoutEnabled === true);
      setUpdatedAt(data.updatedAt || null);
      toast.success(
        data.stkCheckoutEnabled
          ? 'STK checkout enabled platform-wide'
          : 'STK checkout disabled platform-wide'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to save');
      setEnabled(!next);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (next) => {
    setEnabled(next);
    save(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card title="M-Pesa STK Checkout">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <HiOutlineExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Platform-wide kill switch</p>
              <p className="mt-1 text-xs opacity-90">
                When off, no tenant can use M-Pesa STK checkout — even if they
                have their own credentials configured. Individual tenants still
                need to enable STK and save their own Daraja credentials
                (Settings → Payments) before the option appears in their POS.
              </p>
            </div>
          </div>

          <Toggle
            label="Enable STK checkout globally"
            description={
              enabled
                ? 'Tenants may enable M-Pesa STK checkout in their own settings.'
                : 'M-Pesa STK checkout is disabled for all tenants.'
            }
            checked={enabled}
            onChange={toggle}
            disabled={saving}
          />

          {updatedAt ? (
            <p className="text-xs text-[var(--text-muted)]">
              Last changed: {new Date(updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </Card>

      <Card title="How it works">
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
          <li>
            <span className="font-medium text-[var(--text-primary)]">
              Platform switch (this page)
            </span>{' '}
            — a global kill switch. Turn it off to stop all STK activity
            instantly.
          </li>
          <li>
            <span className="font-medium text-[var(--text-primary)]">
              Tenant switch
            </span>{' '}
            — each business owner enables STK in their own Settings → Payments
            and pastes their Safaricom Daraja credentials.
          </li>
          <li>
            <span className="font-medium text-[var(--text-primary)]">
              Effective state
            </span>{' '}
            — STK works only when both switches are on and the tenant has saved
            valid credentials.
          </li>
          <li>
            Credentials are encrypted with AES-256-GCM before storage. Only the
            last 4 characters are shown when a tenant views them back.
          </li>
        </ul>
      </Card>
    </div>
  );
}