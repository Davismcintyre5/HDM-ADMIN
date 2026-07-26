import { useState, useEffect } from 'react';
import { getSpotlights, featurePost, removeSpotlight, extendSpotlight, getSpotlightQueue } from '../../services/rvnp/spotlight';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiStar, HiX, HiPlus } from 'react-icons/hi';

export default function Spotlight() {
  const [spotlights, setSpotlights] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [featureModal, setFeatureModal] = useState({ open: false, postId: null });
  const [featureDays, setFeatureDays] = useState(7);
  const [extendModal, setExtendModal] = useState({ open: false, postId: null });
  const [extendDays, setExtendDays] = useState(3);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSpotlights(), getSpotlightQueue()])
      .then(([s, c]) => {
        setSpotlights(Array.isArray(s.data) ? s.data : s.spotlights || []);
        setCandidates(Array.isArray(c.data) ? c.data : c.candidates || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleFeature = async () => {
    setActionLoading(true);
    try { await featurePost(featureModal.postId, { days: featureDays }); setFeatureModal({ open: false, postId: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleExtend = async () => {
    setActionLoading(true);
    try { await extendSpotlight(extendModal.postId, { days: extendDays }); setExtendModal({ open: false, postId: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRemove = async (postId) => {
    setActionLoading(true);
    try { await removeSpotlight(postId); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Spotlight</h1>

      <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2"><HiStar className="w-5 h-5 text-amber-500" /> Active Spotlights</h2>
      {spotlights.length === 0 ? (
        <Card className="mb-8"><p className="text-sm text-[var(--text-muted)] text-center py-4">No active spotlights.</p></Card>
      ) : (
        <div className="space-y-2 mb-8">
          {spotlights.map(s => (
            <Card key={s._id} className="!p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-[var(--text-primary)]">{s.post?.content || s._id}</p>
                  <p className="text-xs text-[var(--text-muted)]">Expires: {formatDate(s.expiresAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setExtendModal({ open: true, postId: s.post?._id || s._id })}>Extend</Button>
                  <Button size="sm" variant="danger" onClick={() => handleRemove(s.post?._id || s._id)}><HiX className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-[var(--text-primary)] mb-4">Candidates</h2>
      {candidates.length === 0 ? (
        <Card><p className="text-sm text-[var(--text-muted)] text-center py-4">No candidates available.</p></Card>
      ) : (
        <div className="space-y-2">
          {candidates.map(c => (
            <Card key={c._id} className="!p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-[var(--text-primary)]">{c.content || c._id}</p>
                  <p className="text-xs text-[var(--text-muted)]">{c.engagement || 0} engagements</p>
                </div>
                <Button size="sm" variant="success" onClick={() => setFeatureModal({ open: true, postId: c._id })}>
                  <HiPlus className="w-4 h-4" /> Feature
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={featureModal.open} onClose={() => setFeatureModal({ open: false, postId: null })} title="Feature Post">
        <Input label="Days" type="number" value={featureDays} onChange={e => setFeatureDays(+e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setFeatureModal({ open: false, postId: null })}>Cancel</Button>
          <Button variant="success" onClick={handleFeature} loading={actionLoading}>Feature</Button>
        </div>
      </Modal>

      <Modal open={extendModal.open} onClose={() => setExtendModal({ open: false, postId: null })} title="Extend Spotlight">
        <Input label="Days" type="number" value={extendDays} onChange={e => setExtendDays(+e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setExtendModal({ open: false, postId: null })}>Cancel</Button>
          <Button variant="success" onClick={handleExtend} loading={actionLoading}>Extend</Button>
        </div>
      </Modal>
    </div>
  );
}