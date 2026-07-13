import { useState, useEffect } from 'react';
import { getLanding, updateLandingSection } from '../../../services/bizhub/landing';
import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';

const SECTIONS = ['hero', 'features', 'modules', 'pricing', 'testimonials', 'faq', 'cta', 'footer'];

export default function LandingSettings({ onSave, saving }) {
  const [sections, setSections] = useState({});
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subtitle: '', content: '', isActive: true, sortOrder: 0 });

  useEffect(() => {
    getLanding()
      .then(res => {
        const d = res?.data || res || {};
        setSections(typeof d === 'object' && !Array.isArray(d) ? d : {});
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sec = sections[activeSection] || {};
    setForm({ title: sec.title || '', subtitle: sec.subtitle || '', content: sec.content || '', isActive: sec.isActive !== false, sortOrder: sec.sortOrder || 0 });
  }, [activeSection, sections]);

  const handleSave = async () => {
    try {
      await updateLandingSection(activeSection, form);
      setSections(prev => ({ ...prev, [activeSection]: form }));
      alert('Section saved!');
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex gap-2 overflow-x-auto flex-wrap">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${activeSection === s ? 'bg-teal-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>{s}</button>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 capitalize">{activeSection} Section</h2>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y text-sm" />
          </div>
          <Toggle label="Active" checked={form.isActive} onChange={v => setForm({ ...form, isActive: v })} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
          <Button size="sm" onClick={handleSave} loading={saving}>Save {activeSection}</Button>
        </div>
      </Card>
    </div>
  );
}