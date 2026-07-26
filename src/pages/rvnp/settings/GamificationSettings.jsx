import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Button from '../../../components/rvnp/ui/Button';

export default function GamificationSettings({ settings, onSave, saving }) {
  const badges = settings.badges || {};
  const scoring = settings.scoring || {};
  const limits = settings.limits || {};

  const handleSave = () => onSave({ badges, scoring, limits });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Badges</h2>
        <div className="space-y-4">
          <Input label="Newbie (posts)" value={badges.newbiePosts || ''} onChange={e => badges.newbiePosts = e.target.value} />
          <Input label="Contributor (posts)" value={badges.contributorPosts || ''} onChange={e => badges.contributorPosts = e.target.value} />
          <Input label="Veteran (posts)" value={badges.veteranPosts || ''} onChange={e => badges.veteranPosts = e.target.value} />
          <Input label="Legend (posts)" value={badges.legendPosts || ''} onChange={e => badges.legendPosts = e.target.value} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Scoring</h2>
        <div className="space-y-4">
          <Input label="Post Created" value={scoring.postCreated || ''} onChange={e => scoring.postCreated = e.target.value} />
          <Input label="Post Liked" value={scoring.postLiked || ''} onChange={e => scoring.postLiked = e.target.value} />
          <Input label="Comment Added" value={scoring.commentAdded || ''} onChange={e => scoring.commentAdded = e.target.value} />
          <Input label="Group Created" value={scoring.groupCreated || ''} onChange={e => scoring.groupCreated = e.target.value} />
          <Input label="Verification" value={scoring.verification || ''} onChange={e => scoring.verification = e.target.value} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Limits</h2>
        <div className="space-y-4">
          <Input label="Posts Per Day" value={limits.postsPerDay || ''} onChange={e => limits.postsPerDay = e.target.value} />
          <Input label="Groups Per User" value={limits.groupsPerUser || ''} onChange={e => limits.groupsPerUser = e.target.value} />
          <Input label="Listings Per User" value={limits.listingsPerUser || ''} onChange={e => limits.listingsPerUser = e.target.value} />
          <Input label="Stories Per Day" value={limits.storiesPerDay || ''} onChange={e => limits.storiesPerDay = e.target.value} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Gamification</Button>
      </div>
    </div>
  );
}