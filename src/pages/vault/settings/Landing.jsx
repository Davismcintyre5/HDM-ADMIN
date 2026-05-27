import { useEffect, useState } from 'react';
import { getLanding, updateHero, updateFeatures, updateTestimonials, updateFaqs, updateFooter } from '../../../services/vault/landing';
import Input from '../../../components/vault/ui/Input';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';

export default function LandingSettings() {
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);

  useEffect(() => { getLanding().then(setLanding).catch(console.error).finally(() => setLoading(false)); }, []);

  const update = (section, key, value) => {
    setLanding(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      if (section === 'hero') await updateHero(landing.hero);
      else if (section === 'features') await updateFeatures(landing.features);
      else if (section === 'testimonials') await updateTestimonials(landing.testimonials);
      else if (section === 'faqs') await updateFaqs(landing.faqs);
      else if (section === 'footer') await updateFooter(landing.footer);
      alert('Saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!landing) return null;

  const tabs = ['hero', 'features', 'testimonials', 'faqs', 'footer'];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <Button key={t} size="sm" variant={activeTab === t ? 'primary' : 'secondary'} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'hero' && (
        <Card>
          <h3 className="font-semibold mb-4">Hero Section</h3>
          <div className="space-y-3">
            <Input label="Title" value={landing.hero?.title || ''} onChange={(e) => update('hero', 'title', e.target.value)} />
            <Input label="Subtitle" value={landing.hero?.subtitle || ''} onChange={(e) => update('hero', 'subtitle', e.target.value)} />
            <Input label="CTA Primary" value={landing.hero?.ctaPrimary || ''} onChange={(e) => update('hero', 'ctaPrimary', e.target.value)} />
            <Input label="CTA Secondary" value={landing.hero?.ctaSecondary || ''} onChange={(e) => update('hero', 'ctaSecondary', e.target.value)} />
            <Button onClick={() => handleSave('hero')} loading={saving}>Save Hero</Button>
          </div>
        </Card>
      )}

      {activeTab === 'features' && (
        <Card>
          <h3 className="font-semibold mb-4">Features</h3>
          {(landing.features || []).map((f, i) => (
            <div key={i} className="border border-[var(--border-color)] rounded-lg p-3 mb-3 space-y-2">
              <Input label="Icon" value={f.icon || ''} onChange={(e) => {
                const items = [...landing.features]; items[i] = { ...items[i], icon: e.target.value }; setLanding(prev => ({ ...prev, features: items }));
              }} />
              <Input label="Title" value={f.title || ''} onChange={(e) => { const items = [...landing.features]; items[i] = { ...items[i], title: e.target.value }; setLanding(prev => ({ ...prev, features: items })); }} />
              <Input label="Description" value={f.description || ''} onChange={(e) => { const items = [...landing.features]; items[i] = { ...items[i], description: e.target.value }; setLanding(prev => ({ ...prev, features: items })); }} />
            </div>
          ))}
          <Button onClick={() => handleSave('features')} loading={saving}>Save Features</Button>
        </Card>
      )}

      {activeTab === 'testimonials' && (
        <Card>
          <h3 className="font-semibold mb-4">Testimonials</h3>
          {(landing.testimonials || []).map((t, i) => (
            <div key={i} className="border border-[var(--border-color)] rounded-lg p-3 mb-3 space-y-2">
              <Input label="Name" value={t.name || ''} onChange={(e) => { const items = [...landing.testimonials]; items[i] = { ...items[i], name: e.target.value }; setLanding(prev => ({ ...prev, testimonials: items })); }} />
              <Input label="Role" value={t.role || ''} onChange={(e) => { const items = [...landing.testimonials]; items[i] = { ...items[i], role: e.target.value }; setLanding(prev => ({ ...prev, testimonials: items })); }} />
              <Input label="Quote" value={t.quote || ''} onChange={(e) => { const items = [...landing.testimonials]; items[i] = { ...items[i], quote: e.target.value }; setLanding(prev => ({ ...prev, testimonials: items })); }} />
              <Input label="Rating (1-5)" type="number" min="1" max="5" value={t.rating || ''} onChange={(e) => { const items = [...landing.testimonials]; items[i] = { ...items[i], rating: Number(e.target.value) }; setLanding(prev => ({ ...prev, testimonials: items })); }} />
            </div>
          ))}
          <Button onClick={() => handleSave('testimonials')} loading={saving}>Save Testimonials</Button>
        </Card>
      )}

      {activeTab === 'faqs' && (
        <Card>
          <h3 className="font-semibold mb-4">FAQs</h3>
          {(landing.faqs || []).map((f, i) => (
            <div key={i} className="border border-[var(--border-color)] rounded-lg p-3 mb-3 space-y-2">
              <Input label="Question" value={f.question || ''} onChange={(e) => { const items = [...landing.faqs]; items[i] = { ...items[i], question: e.target.value }; setLanding(prev => ({ ...prev, faqs: items })); }} />
              <Input label="Answer" value={f.answer || ''} onChange={(e) => { const items = [...landing.faqs]; items[i] = { ...items[i], answer: e.target.value }; setLanding(prev => ({ ...prev, faqs: items })); }} />
            </div>
          ))}
          <Button onClick={() => handleSave('faqs')} loading={saving}>Save FAQs</Button>
        </Card>
      )}

      {activeTab === 'footer' && (
        <Card>
          <h3 className="font-semibold mb-4">Footer</h3>
          <div className="space-y-3">
            <Input label="Copyright" value={landing.footer?.copyright || ''} onChange={(e) => update('footer', 'copyright', e.target.value)} />
            {(landing.footer?.links || []).map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input label="Label" value={l.label || ''} onChange={(e) => { const items = [...(landing.footer?.links || [])]; items[i] = { ...items[i], label: e.target.value }; setLanding(prev => ({ ...prev, footer: { ...prev.footer, links: items } })); }} />
                <Input label="URL" value={l.url || ''} onChange={(e) => { const items = [...(landing.footer?.links || [])]; items[i] = { ...items[i], url: e.target.value }; setLanding(prev => ({ ...prev, footer: { ...prev.footer, links: items } })); }} />
              </div>
            ))}
            <Button onClick={() => handleSave('footer')} loading={saving}>Save Footer</Button>
          </div>
        </Card>
      )}
    </div>
  );
}