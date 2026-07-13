import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../../services/marketbridge/settings';
import { getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone, getPickupPoints, createPickupPoint, updatePickupPoint, deletePickupPoint } from '../../services/marketbridge/shipping';
import Card from '../../components/marketbridge/ui/Card';
import Input from '../../components/marketbridge/ui/Input';
import Toggle from '../../components/marketbridge/ui/Toggle';
import Button from '../../components/marketbridge/ui/Button';
import Badge from '../../components/marketbridge/ui/Badge';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function Shipping() {
  const [settings, setSettings] = useState({});
  const [zones, setZones] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingRates, setSavingRates] = useState(false);

  // Zone modal
  const [zoneModal, setZoneModal] = useState({ open: false, mode: 'create', data: null });
  const [zoneForm, setZoneForm] = useState({ name: '', counties: '', baseFee: 0, perKgRate: 0, freeThreshold: 0, maxWeight: 0, estimatedDays: '' });

  // Pickup modal
  const [pickupModal, setPickupModal] = useState({ open: false, mode: 'create', data: null });
  const [pickupForm, setPickupForm] = useState({ name: '', address: '', city: '', county: '', phone: '', fee: 0, openingHours: '' });

  // Confirm
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });

  const getVal = (key, fallback = '') => settings[key] || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getSettings().catch(() => ({ data: {} })),
      getShippingZones().catch(() => ({ data: [] })),
      getPickupPoints().catch(() => ({ data: [] })),
    ]).then(([s, z, p]) => {
      const d = s?.data || s || {};
      const map = {};
      if (Array.isArray(d)) d.forEach(x => { map[x.key || x._id] = x.value; });
      else Object.entries(d).forEach(([k, v]) => { map[k] = typeof v === 'object' ? v.value : v; });
      setSettings(map);
      setZones(z?.data || z || []);
      setPickups(p?.data || p || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (key, value) => {
    try { await updateSetting(key, value ?? settings[key]); setSettings(prev => ({ ...prev, [key]: value ?? prev[key] })); }
    catch (e) { alert(e.message); }
  };

  const handleSaveRates = async () => {
    setSavingRates(true);
    const keys = ['shipping_default_fee', 'shipping_free_threshold', 'shipping_per_kg', 'shipping_max_weight'];
    for (const key of keys) await handleSave(key, settings[key]);
    setSavingRates(false);
    alert('Default rates saved!');
  };

  // Zones
  const openCreateZone = () => { setZoneForm({ name: '', counties: '', baseFee: 0, perKgRate: 0, freeThreshold: 0, maxWeight: 0, estimatedDays: '' }); setZoneModal({ open: true, mode: 'create', data: null }); };
  const openEditZone = (zone) => { setZoneForm({ name: zone.name || '', counties: (zone.counties || []).join(', '), baseFee: zone.baseFee || 0, perKgRate: zone.perKgRate || 0, freeThreshold: zone.freeThreshold || 0, maxWeight: zone.maxWeight || 0, estimatedDays: zone.estimatedDays || '' }); setZoneModal({ open: true, mode: 'edit', data: zone }); };

  const handleSaveZone = async () => {
    setActionLoading(true);
    try {
      const data = { ...zoneForm, counties: zoneForm.counties.split(',').map(c => c.trim()).filter(Boolean) };
      if (zoneModal.mode === 'create') await createShippingZone(data);
      else await updateShippingZone(zoneModal.data._id || zoneModal.data.id, data);
      setZoneModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  // Pickups
  const openCreatePickup = () => { setPickupForm({ name: '', address: '', city: '', county: '', phone: '', fee: 0, openingHours: '' }); setPickupModal({ open: true, mode: 'create', data: null }); };
  const openEditPickup = (p) => { setPickupForm({ name: p.name || '', address: p.address || '', city: p.city || '', county: p.county || '', phone: p.phone || '', fee: p.fee || 0, openingHours: p.openingHours || '' }); setPickupModal({ open: true, mode: 'edit', data: p }); };

  const handleSavePickup = async () => {
    setActionLoading(true);
    try {
      if (pickupModal.mode === 'create') await createPickupPoint(pickupForm);
      else await updatePickupPoint(pickupModal.data._id || pickupModal.data.id, pickupForm);
      setPickupModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'zone') await deleteShippingZone(confirm.id);
      else if (confirm.type === 'pickup') await deletePickupPoint(confirm.id);
      fetchData();
    } catch (e) { alert(e.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">🚚 Shipping & Pickup</h1>

      <div className="space-y-6">
        {/* Section 1 — Default Rates */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Default Shipping Rates</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Default Fee (KES)" type="number" value={getVal('shipping_default_fee', '200')} onChange={e => setSettings(prev => ({ ...prev, shipping_default_fee: e.target.value }))} />
            <Input label="Free Shipping Threshold (KES)" type="number" value={getVal('shipping_free_threshold', '5000')} onChange={e => setSettings(prev => ({ ...prev, shipping_free_threshold: e.target.value }))} />
            <Input label="Per Kg Rate (KES)" type="number" value={getVal('shipping_per_kg', '0')} onChange={e => setSettings(prev => ({ ...prev, shipping_per_kg: e.target.value }))} />
            <Input label="Max Weight (kg)" type="number" value={getVal('shipping_max_weight', '30')} onChange={e => setSettings(prev => ({ ...prev, shipping_max_weight: e.target.value }))} />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)]">Default rates apply when no zone is matched</span>
            <Button size="sm" onClick={handleSaveRates} loading={savingRates}>Save Rates</Button>
          </div>
        </Card>

        {/* Section 2 — Shipping Zones */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Shipping Zones</h2>
            <Button size="sm" onClick={openCreateZone}><HiPlus className="w-4 h-4 mr-1" /> Add Zone</Button>
          </div>
          {zones.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No shipping zones defined.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                  <tr><th className="px-3 py-2 text-left">Zone</th><th className="px-3 py-2 text-left">Counties</th><th className="px-3 py-2 text-left">Fee</th><th className="px-3 py-2 text-left">Free Above</th><th className="px-3 py-2 text-left">Est. Days</th><th className="px-3 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {zones.map(z => (
                    <tr key={z._id || z.id} className="hover:bg-[var(--bg-secondary)]">
                      <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{z.name}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{(z.counties || []).join(', ')}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">KES {z.baseFee || 0}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">KES {z.freeThreshold || 0}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{z.estimatedDays || '—'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="secondary" onClick={() => openEditZone(z)}><HiPencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: z._id || z.id, type: 'zone', name: z.name })}><HiTrash className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 3 — Pickup Points */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Pickup Points</h2>
            <Button size="sm" onClick={openCreatePickup}><HiPlus className="w-4 h-4 mr-1" /> Add Point</Button>
          </div>
          <div className="mb-4">
            <Toggle label="Enable Pickup Points" checked={isTrue('pickup_enabled')} onChange={v => {
              const val = v ? 'true' : 'false';
              setSettings(prev => ({ ...prev, pickup_enabled: val }));
              handleSave('pickup_enabled', val);
            }} />
          </div>
          {pickups.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No pickup points defined.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                  <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Address</th><th className="px-3 py-2 text-left">City</th><th className="px-3 py-2 text-left">Phone</th><th className="px-3 py-2 text-left">Fee</th><th className="px-3 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {pickups.map(p => (
                    <tr key={p._id || p.id} className="hover:bg-[var(--bg-secondary)]">
                      <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{p.name}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{p.address}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">{p.city}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{p.phone || '—'}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">{p.fee > 0 ? `KES ${p.fee}` : <Badge variant="success">Free</Badge>}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="secondary" onClick={() => openEditPickup(p)}><HiPencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: p._id || p.id, type: 'pickup', name: p.name })}><HiTrash className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Zone Modal */}
      <Modal open={zoneModal.open} onClose={() => setZoneModal({ open: false, mode: 'create', data: null })} title={zoneModal.mode === 'create' ? 'Add Shipping Zone' : 'Edit Shipping Zone'} size="lg">
        <div className="space-y-4">
          <Input label="Zone Name" value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} required />
          <Input label="Counties (comma separated)" value={zoneForm.counties} onChange={e => setZoneForm({ ...zoneForm, counties: e.target.value })} placeholder="Nairobi, Kiambu, Machakos" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Fee (KES)" type="number" value={zoneForm.baseFee} onChange={e => setZoneForm({ ...zoneForm, baseFee: +e.target.value })} />
            <Input label="Per Kg Rate (KES)" type="number" value={zoneForm.perKgRate} onChange={e => setZoneForm({ ...zoneForm, perKgRate: +e.target.value })} />
            <Input label="Free Threshold (KES)" type="number" value={zoneForm.freeThreshold} onChange={e => setZoneForm({ ...zoneForm, freeThreshold: +e.target.value })} />
            <Input label="Max Weight (kg)" type="number" value={zoneForm.maxWeight} onChange={e => setZoneForm({ ...zoneForm, maxWeight: +e.target.value })} />
          </div>
          <Input label="Estimated Days" value={zoneForm.estimatedDays} onChange={e => setZoneForm({ ...zoneForm, estimatedDays: e.target.value })} placeholder="1-2 days" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setZoneModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSaveZone} loading={actionLoading}>{zoneModal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Pickup Modal */}
      <Modal open={pickupModal.open} onClose={() => setPickupModal({ open: false, mode: 'create', data: null })} title={pickupModal.mode === 'create' ? 'Add Pickup Point' : 'Edit Pickup Point'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={pickupForm.name} onChange={e => setPickupForm({ ...pickupForm, name: e.target.value })} required />
          <Input label="Address" value={pickupForm.address} onChange={e => setPickupForm({ ...pickupForm, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={pickupForm.city} onChange={e => setPickupForm({ ...pickupForm, city: e.target.value })} required />
            <Input label="County" value={pickupForm.county} onChange={e => setPickupForm({ ...pickupForm, county: e.target.value })} required />
            <Input label="Phone" value={pickupForm.phone} onChange={e => setPickupForm({ ...pickupForm, phone: e.target.value })} />
            <Input label="Fee (KES)" type="number" value={pickupForm.fee} onChange={e => setPickupForm({ ...pickupForm, fee: +e.target.value })} />
          </div>
          <Input label="Opening Hours" value={pickupForm.openingHours} onChange={e => setPickupForm({ ...pickupForm, openingHours: e.target.value })} placeholder="8am-6pm" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setPickupModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSavePickup} loading={actionLoading}>{pickupModal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleDelete}
        title={`Delete ${confirm.type === 'zone' ? 'Shipping Zone' : 'Pickup Point'}`} message={`Delete ${confirm.name}?`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}