import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Button from '../../../components/rvnp/ui/Button';

export default function GamificationSettings({ settings, setSettings, onSave, saving }) {
  const badges = settings.badges || {};
  const scoring = settings.scoring || {};
  const limits = settings.limits || {};

  const setBadge = (key, value) => setSettings(prev => ({ ...prev, badges: { ...prev.badges, [key]: value } }));
  const setScoring = (key, value) => setSettings(prev => ({ ...prev, scoring: { ...prev.scoring, [key]: value } }));
  const setLimit = (key, value) => setSettings(prev => ({ ...prev, limits: { ...prev.limits, [key]: value } }));

  const handleSave = () => onSave({ badges: settings.badges, scoring: settings.scoring, limits: settings.limits });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Badges</h2>
        <div className="space-y-4">
          <Input label="Top Contributor Weekly (posts)" type="number" value={badges.topContributorWeeklyCount || ''} onChange={e => setBadge('topContributorWeeklyCount', e.target.value)} />
          <Input label="Top Contributor Monthly (posts)" type="number" value={badges.topContributorMonthlyCount || ''} onChange={e => setBadge('topContributorMonthlyCount', e.target.value)} />
          <Input label="Top Fan Threshold" type="number" value={badges.topFanThreshold || ''} onChange={e => setBadge('topFanThreshold', e.target.value)} />
          <Input label="Marketplace Champion Sales" type="number" value={badges.marketplaceChampionSales || ''} onChange={e => setBadge('marketplaceChampionSales', e.target.value)} />
          <Input label="Group Builder Members" type="number" value={badges.groupBuilderMembers || ''} onChange={e => setBadge('groupBuilderMembers', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Scoring</h2>
        <div className="space-y-4">
          <Input label="Post Created" type="number" value={scoring.post || ''} onChange={e => setScoring('post', e.target.value)} />
          <Input label="Comment" type="number" value={scoring.comment || ''} onChange={e => setScoring('comment', e.target.value)} />
          <Input label="Helpful Answer" type="number" value={scoring.helpfulAnswer || ''} onChange={e => setScoring('helpfulAnswer', e.target.value)} />
          <Input label="Listing Sold" type="number" value={scoring.listingSold || ''} onChange={e => setScoring('listingSold', e.target.value)} />
          <Input label="Lost & Found Returned" type="number" value={scoring.lostFoundReturned || ''} onChange={e => setScoring('lostFoundReturned', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Limits</h2>
        <div className="space-y-4">
          <Input label="Post Max Characters" type="number" value={limits.postMaxChars || ''} onChange={e => setLimit('postMaxChars', e.target.value)} />
          <Input label="Comment Max Characters" type="number" value={limits.commentMaxChars || ''} onChange={e => setLimit('commentMaxChars', e.target.value)} />
          <Input label="Posts Per Page" type="number" value={limits.postsPerPage || ''} onChange={e => setLimit('postsPerPage', e.target.value)} />
          <Input label="Users Per Page" type="number" value={limits.usersPerPage || ''} onChange={e => setLimit('usersPerPage', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Gamification</Button>
      </div>
    </div>
  );
}