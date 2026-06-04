import { useEffect, useState } from 'react';
import { getContent, updateContent } from '../../../services/bizhub/content';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const CONTENT_TABS = ['hero', 'features', 'pricing', 'footer'];

export default function ContentSettings() {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getContent(activeTab)
      .then(res => {
        const data = res.data || res;
        setContent(data[activeTab] || data);
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const updateField = (key, value) => setContent(prev => ({ ...prev, [key]: value }));
  const updateNested = (objKey, key, value) => setContent(prev => ({ ...prev, [objKey]: { ...prev[objKey], [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent(activeTab, content);
      alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved`);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex gap-2 flex-wrap">
        {CONTENT_TABS.map(t => (
          <Button key={t} size="sm" variant={activeTab === t ? 'primary' : 'secondary'} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {!content ? (
        <Card>
          <p className="text-[var(--text-muted)] text-sm py-4 text-center">
            No content found for this section. Fill in the form and save to create it.
          </p>
        </Card>
      ) : (
        <Card>
          {/* Hero */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <Input label="Title" value={content.title || ''} onChange={(e) => updateField('title', e.target.value)} />
              <Input label="Subtitle" value={content.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)} />
              <Input label="CTA Text" value={content.ctaText || ''} onChange={(e) => updateField('ctaText', e.target.value)} />
              <Input label="CTA Link" value={content.ctaLink || ''} onChange={(e) => updateField('ctaLink', e.target.value)} />
              <Input label="Background URL" value={content.background || ''} onChange={(e) => updateField('background', e.target.value)} />
              <Toggle label="Visible" checked={content.visible !== false} onChange={(v) => updateField('visible', v)} />
            </div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <Input label="Section Title" value={content.title || ''} onChange={(e) => updateField('title', e.target.value)} />
              {(content.modules || []).map((m, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <Input label="Icon" value={m.icon || ''} onChange={(e) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], icon: e.target.value }; updateField('modules', mods);
                  }} />
                  <Input label="Title" value={m.title || ''} onChange={(e) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], title: e.target.value }; updateField('modules', mods);
                  }} />
                  <Input label="Description" value={m.description || ''} onChange={(e) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], description: e.target.value }; updateField('modules', mods);
                  }} />
                  <Input label="CTA Text" value={m.ctaText || ''} onChange={(e) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], ctaText: e.target.value }; updateField('modules', mods);
                  }} />
                  <Toggle label="Active" checked={m.active !== false} onChange={(v) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], active: v }; updateField('modules', mods);
                  }} />
                  <Input label="Order" type="number" value={m.order || ''} onChange={(e) => {
                    const mods = [...content.modules]; mods[i] = { ...mods[i], order: Number(e.target.value) }; updateField('modules', mods);
                  }} />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => updateField('modules', [...(content.modules || []), { icon: '', title: '', description: '', ctaText: 'Learn More', active: true, order: (content.modules || []).length + 1 }])}>
                + Add Module
              </Button>
            </div>
          )}

          {/* Pricing */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Landing Page Plans</h3>
                <Input label="Section Title" value={content.title || ''} onChange={(e) => updateField('title', e.target.value)} />
                <div className="space-y-4 mt-4">
                  {(content.plans || []).map((p, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{p.plan}</span>
                        <Toggle checked={p.active !== false} onChange={(v) => {
                          const plans = [...content.plans]; plans[i] = { ...plans[i], active: v }; updateField('plans', plans);
                        }} />
                      </div>
                      <Input label="Price (KES)" type="number" value={p.price || ''} onChange={(e) => {
                        const plans = [...content.plans]; plans[i] = { ...plans[i], price: Number(e.target.value) }; updateField('plans', plans);
                      }} />
                      <Input label="Period" value={p.period || ''} onChange={(e) => {
                        const plans = [...content.plans]; plans[i] = { ...plans[i], period: e.target.value }; updateField('plans', plans);
                      }} />
                      <Input label="Features (comma separated)" value={(p.features || []).join(', ')} onChange={(e) => {
                        const plans = [...content.plans]; plans[i] = { ...plans[i], features: e.target.value.split(',').map(s => s.trim()) }; updateField('plans', plans);
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Module-Specific Pricing</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Set individual pricing for each business module.</p>
                {['pharma', 'electro', 'resto', 'apartment'].map(mod => {
                  const modulePricing = content.modulePricing?.[mod] || { monthly: 615, yearly: 6770, lifetime: 12925 };
                  const icons = { pharma: '💊', electro: '📱', resto: '🍽️', apartment: '🏢' };
                  const names = { pharma: 'PharmaSys', electro: 'ElectroStore', resto: 'RestoManagerKE', apartment: 'MyApartment' };
                  return (
                    <div key={mod} className="p-4 rounded-lg border border-[var(--border-color)] mb-3">
                      <h4 className="font-medium text-[var(--text-primary)] mb-3">{icons[mod]} {names[mod]}</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <Input label="Monthly (KES)" type="number" value={modulePricing.monthly || ''} onChange={(e) => {
                          const mp = { ...(content.modulePricing || {}) };
                          mp[mod] = { ...mp[mod], monthly: Number(e.target.value) };
                          updateField('modulePricing', mp);
                        }} />
                        <Input label="Yearly (KES)" type="number" value={modulePricing.yearly || ''} onChange={(e) => {
                          const mp = { ...(content.modulePricing || {}) };
                          mp[mod] = { ...mp[mod], yearly: Number(e.target.value) };
                          updateField('modulePricing', mp);
                        }} />
                        <Input label="Lifetime (KES)" type="number" value={modulePricing.lifetime || ''} onChange={(e) => {
                          const mp = { ...(content.modulePricing || {}) };
                          mp[mod] = { ...mp[mod], lifetime: Number(e.target.value) };
                          updateField('modulePricing', mp);
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          {activeTab === 'footer' && (
            <div className="space-y-4">
              <Input label="Company Name" value={content.companyName || ''} onChange={(e) => updateField('companyName', e.target.value)} />
              <Input label="Tagline" value={content.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} />
              <Input label="Copyright" value={content.copyright || ''} onChange={(e) => updateField('copyright', e.target.value)} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Facebook" value={content.social?.facebook || ''} onChange={(e) => updateNested('social', 'facebook', e.target.value)} />
                <Input label="Twitter" value={content.social?.twitter || ''} onChange={(e) => updateNested('social', 'twitter', e.target.value)} />
                <Input label="Instagram" value={content.social?.instagram || ''} onChange={(e) => updateNested('social', 'instagram', e.target.value)} />
              </div>
              <h4 className="font-medium text-sm mt-4">Footer Columns</h4>
              {(content.columns || []).map((col, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <Input label="Column Title" value={col.title || ''} onChange={(e) => {
                    const cols = [...content.columns]; cols[i] = { ...cols[i], title: e.target.value }; updateField('columns', cols);
                  }} />
                  {(col.links || []).map((link, j) => (
                    <div key={j} className="flex gap-2">
                      <Input label="Label" value={link.label || ''} onChange={(e) => {
                        const cols = [...content.columns]; cols[i].links[j] = { ...cols[i].links[j], label: e.target.value }; updateField('columns', cols);
                      }} />
                      <Input label="URL" value={link.url || ''} onChange={(e) => {
                        const cols = [...content.columns]; cols[i].links[j] = { ...cols[i].links[j], url: e.target.value }; updateField('columns', cols);
                      }} />
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => {
                    const cols = [...content.columns]; cols[i].links = [...(cols[i].links || []), { label: '', url: '' }]; updateField('columns', cols);
                  }}>+ Add Link</Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => updateField('columns', [...(content.columns || []), { title: '', links: [] }])}>
                + Add Column
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button onClick={handleSave} loading={saving}>Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}