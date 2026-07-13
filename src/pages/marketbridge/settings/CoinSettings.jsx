import { useState, useEffect } from 'react';
import Card from '../../../components/marketbridge/ui/Card';
import Input from '../../../components/marketbridge/ui/Input';
import Toggle from '../../../components/marketbridge/ui/Toggle';
import Button from '../../../components/marketbridge/ui/Button';
import Spinner from '../../../components/marketbridge/ui/Spinner';
import { HiPlus, HiTrash } from 'react-icons/hi';

export default function CoinSettings({ settings = {}, setSettings, onSave }) {
  const [ranges, setRanges] = useState([]);
  const [savingSection, setSavingSection] = useState('');

  const getVal = (key, fallback = '') => (settings && settings[key]) || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  useEffect(() => {
    try {
      const raw = getVal('coins_redemption_ranges', '[]');
      setRanges(JSON.parse(raw));
    } catch { setRanges([]); }
  }, [settings]);

  const handleToggle = (key, checked) => {
    const val = checked ? 'true' : 'false';
    if (setSettings) setSettings(prev => ({ ...prev, [key]: val }));
    if (typeof onSave === 'function') onSave(key, val);
  };

  const handleSaveSection = async (section) => {
    setSavingSection(section);
    if (section === 'general') {
      const keys = ['coins_earn_rate', 'coins_redeem_rate', 'coins_max_redeem', 'coins_expiry_days'];
      for (const key of keys) {
        if (typeof onSave === 'function') await onSave(key, settings[key] || '');
      }
    } else if (section === 'earning') {
      const keys = ['coins_registration', 'coins_phone_verify', 'coins_email_verify', 'coins_daily_login', 'coins_referral_signup', 'coins_referral_order'];
      for (const key of keys) {
        if (typeof onSave === 'function') await onSave(key, settings[key] || '');
      }
    } else if (section === 'ranges') {
      if (typeof onSave === 'function') await onSave('coins_redemption_ranges', JSON.stringify(ranges));
    }
    setSavingSection('');
    alert(`${section} settings saved!`);
  };

  const addRange = () => setRanges([...ranges, { min: 0, max: 5000, maxCoins: 500 }]);
  const removeRange = (i) => setRanges(ranges.filter((_, idx) => idx !== i));
  const updateRange = (i, field, value) => {
    const updated = [...ranges];
    updated[i][field] = Number(value);
    setRanges(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Section 1 — General */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">General Settings</h2>
        <div className="space-y-4">
          <Toggle label="Enable Coins Program" checked={isTrue('coins_enabled')} onChange={v => handleToggle('coins_enabled', v)}
            description="Master switch for the loyalty coins program" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Earn Rate (coins per KSh 100)" type="number" value={getVal('coins_earn_rate', '1')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_earn_rate: e.target.value })); }} />
            <Input label="Redeem Rate (1 coin = KSh)" type="number" value={getVal('coins_redeem_rate', '1')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_redeem_rate: e.target.value })); }} />
            <Input label="Max Redeem % of Order" type="number" value={getVal('coins_max_redeem', '50')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_max_redeem: e.target.value })); }} />
            <Input label="Expiry (days)" type="number" value={getVal('coins_expiry_days', '180')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_expiry_days: e.target.value })); }} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Earn rate, redeem rate, max redeem %, expiry</span>
          <Button size="sm" onClick={() => handleSaveSection('general')} loading={savingSection === 'general'}>Save General</Button>
        </div>
      </Card>

      {/* Section 2 — Earning Occasions */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Earning Occasions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Registration (coins)" type="number" value={getVal('coins_registration', '50')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_registration: e.target.value })); }} />
          <Input label="Phone Verification (coins)" type="number" value={getVal('coins_phone_verify', '25')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_phone_verify: e.target.value })); }} />
          <Input label="Email Verification (coins)" type="number" value={getVal('coins_email_verify', '20')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_email_verify: e.target.value })); }} />
          <Input label="Daily Login (coins)" type="number" value={getVal('coins_daily_login', '5')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_daily_login: e.target.value })); }} />
          <Input label="Referral Signup (coins)" type="number" value={getVal('coins_referral_signup', '100')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_referral_signup: e.target.value })); }} />
          <Input label="Referral Order (coins)" type="number" value={getVal('coins_referral_order', '200')} onChange={e => { if (setSettings) setSettings(prev => ({ ...prev, coins_referral_order: e.target.value })); }} />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Coins awarded for each activity</span>
          <Button size="sm" onClick={() => handleSaveSection('earning')} loading={savingSection === 'earning'}>Save Earning</Button>
        </div>
      </Card>

      {/* Section 3 — Redemption Ranges */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Redemption Ranges</h2>
          <Button size="sm" onClick={addRange}><HiPlus className="w-4 h-4 mr-1" /> Add Range</Button>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Limit how many coins can be redeemed based on order total.</p>
        
        {ranges.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No ranges defined. Click "Add Range" to create one.</p>
        ) : (
          <div className="space-y-3">
            {ranges.map((range, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">KSh</span>
                  <Input
                    type="number"
                    value={range.min}
                    onChange={e => updateRange(i, 'min', e.target.value)}
                    placeholder="0"
                    className="flex-1 min-w-[80px]"
                  />
                  <span className="text-xs text-[var(--text-muted)]">to</span>
                  <Input
                    type="number"
                    value={range.max}
                    onChange={e => updateRange(i, 'max', e.target.value)}
                    placeholder="5000"
                    className="flex-1 min-w-[80px]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Max Coins:</span>
                  <Input
                    type="number"
                    value={range.maxCoins}
                    onChange={e => updateRange(i, 'maxCoins', e.target.value)}
                    placeholder="500"
                    className="w-24"
                  />
                  <Button size="sm" variant="danger" onClick={() => removeRange(i)}><HiTrash className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Order ranges for coin redemption limits</span>
          <Button size="sm" onClick={() => handleSaveSection('ranges')} loading={savingSection === 'ranges'}>Save Ranges</Button>
        </div>
      </Card>
    </div>
  );
}