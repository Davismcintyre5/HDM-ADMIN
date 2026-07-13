import { useState, useEffect } from 'react';
import { getAgents, createAgent, updateAgent, deactivateAgent, permanentDeleteAgent } from '../../services/marketbridge/agents';
import { getPickupPoints } from '../../services/marketbridge/shipping';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiPlus, HiPencil, HiBan, HiTrash } from 'react-icons/hi';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', pickupPointId: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAgents().catch(() => ({ data: [] })),
      getPickupPoints().catch(() => ({ data: [] })),
    ]).then(([a, p]) => {
      setAgents(a?.data || a || []);
      setPickupPoints(p?.data || p || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', phone: '', password: '', pickupPointId: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (agent) => { setForm({ name: agent.name || '', email: agent.email || '', phone: agent.phone || '', password: '', pickupPointId: agent.pickupPointId?._id || agent.pickupPointId || '' }); setModal({ open: true, mode: 'edit', data: agent }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form };
      if (modal.mode === 'edit' && !data.password) delete data.password;
      if (modal.mode === 'create') await createAgent(data);
      else await updateAgent(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'deactivate') await deactivateAgent(confirm.id);
      else if (confirm.type === 'delete') await permanentDeleteAgent(confirm.id);
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '', type: '' });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">🧑‍💼 Pickup Agents</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Agent</Button>
      </div>

      <Card>
        {agents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No agents yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">County</th>
                  <th className="px-3 py-2 text-left">Town</th>
                  <th className="px-3 py-2 text-left">Pickup Point</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {agents.map(agent => (
                  <tr key={agent._id || agent.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{agent.name}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)] text-xs">{agent.email}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{agent.phone || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{agent.pickupPointId?.county || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{agent.pickupPointId?.city || '—'}</td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{agent.pickupPointId?.name || '—'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{agent.pickupPointId?.address}</p>
                        {agent.pickupPointId?.openingHours && (
                          <p className="text-xs text-[var(--text-muted)]">🕐 {agent.pickupPointId.openingHours}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2"><Badge variant={agent.status === 'active' ? 'success' : 'danger'}>{agent.status}</Badge></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(agent)}><HiPencil className="w-4 h-4" /></Button>
                        {agent.status === 'active' && (
                          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: agent._id || agent.id, name: agent.name, type: 'deactivate' })}><HiBan className="w-4 h-4" /></Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: agent._id || agent.id, name: agent.name, type: 'delete' })}><HiTrash className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Agent' : 'Edit Agent'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label={modal.mode === 'create' ? 'Password' : 'Password (leave empty to keep)'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={modal.mode === 'create'} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Pickup Point</label>
            <select value={form.pickupPointId} onChange={e => {
              const pp = pickupPoints.find(p => (p._id || p.id) === e.target.value);
              setForm({ ...form, pickupPointId: e.target.value });
            }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="">Select pickup point...</option>
              {pickupPoints.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} — {p.address}, {p.city}{p.county ? `, ${p.county}` : ''}
                </option>
              ))}
            </select>
            {form.pickupPointId && (
              <div className="mt-2 bg-[var(--bg-secondary)] rounded-lg p-3 text-xs text-[var(--text-muted)]">
                {(() => {
                  const pp = pickupPoints.find(p => (p._id || p.id) === form.pickupPointId);
                  if (!pp) return null;
                  return (
                    <div className="space-y-1">
                      <p><strong>Address:</strong> {pp.address}</p>
                      <p><strong>City:</strong> {pp.city}</p>
                      {pp.county && <p><strong>County:</strong> {pp.county}</p>}
                      {pp.phone && <p><strong>Phone:</strong> {pp.phone}</p>}
                      {pp.openingHours && <p><strong>Hours:</strong> {pp.openingHours}</p>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        open={confirm.open} 
        onClose={() => setConfirm({ open: false, id: null, name: '', type: '' })} 
        onConfirm={handleConfirm}
        title={confirm.type === 'delete' ? 'Delete Agent' : 'Deactivate Agent'} 
        message={confirm.type === 'delete' ? `Permanently delete ${confirm.name}? This cannot be undone.` : `Deactivate ${confirm.name}?`} 
        confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Deactivate'} 
        variant={confirm.type === 'delete' ? 'danger' : 'warning'} 
        loading={actionLoading} 
      />
    </div>
  );
}