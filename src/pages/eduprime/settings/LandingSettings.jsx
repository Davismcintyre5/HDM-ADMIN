import { useState } from 'react';
import Card from '../../../components/eduprime/ui/Card';
import Input from '../../../components/eduprime/ui/Input';
import Toggle from '../../../components/eduprime/ui/Toggle';
import Button from '../../../components/eduprime/ui/Button';
import Modal from '../../../components/eduprime/ui/Modal';
import ConfirmDialog from '../../../components/eduprime/ui/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const PLATFORMS = [
  { value: 'win', label: 'Windows' },
  { value: 'mac', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

export default function LandingSettings({ settings, setSettings, onSave, saving }) {
  const landing = settings.landing || {};
  const features = landing.landing_features || [];
  const downloads = landing.landing_downloads || [];
  const testimonials = landing.landing_testimonials || [];

  const updateLanding = (key, value) => setSettings(prev => ({ ...prev, landing: { ...prev.landing, [key]: value } }));

  // Features
  const [featureModal, setFeatureModal] = useState({ open: false, mode: 'create', data: null });
  const [featureForm, setFeatureForm] = useState({ icon: '📚', title: '', description: '', order: 1, isActive: true });
  const [featureDelete, setFeatureDelete] = useState({ open: false, id: null, title: '' });

  const openFeatureCreate = () => { setFeatureForm({ icon: '📚', title: '', description: '', order: features.length + 1, isActive: true }); setFeatureModal({ open: true, mode: 'create', data: null }); };
  const openFeatureEdit = (f) => { setFeatureForm(f); setFeatureModal({ open: true, mode: 'edit', data: f }); };

  const handleFeatureSave = () => {
    let updated;
    if (featureModal.mode === 'create') {
      updated = [...features, { ...featureForm, id: generateId() }];
    } else {
      updated = features.map(f => f.id === featureForm.id ? featureForm : f);
    }
    updateLanding('landing_features', updated);
    setFeatureModal({ open: false, mode: 'create', data: null });
  };

  const handleFeatureDelete = () => {
    updateLanding('landing_features', features.filter(f => f.id !== featureDelete.id));
    setFeatureDelete({ open: false, id: null, title: '' });
  };

  // Downloads
  const [downloadModal, setDownloadModal] = useState({ open: false, mode: 'create', data: null });
  const [downloadForm, setDownloadForm] = useState({ platform: 'win', name: '', version: '', url: '', size: '', isActive: true, requirements: '' });
  const [downloadDelete, setDownloadDelete] = useState({ open: false, id: null, name: '' });

  const openDownloadCreate = () => { setDownloadForm({ platform: 'win', name: '', version: '', url: '', size: '', isActive: true, requirements: '' }); setDownloadModal({ open: true, mode: 'create', data: null }); };
  const openDownloadEdit = (d) => { setDownloadForm(d); setDownloadModal({ open: true, mode: 'edit', data: d }); };

  const handleDownloadSave = () => {
    let updated;
    if (downloadModal.mode === 'create') {
      updated = [...downloads, { ...downloadForm, id: generateId() }];
    } else {
      updated = downloads.map(d => d.id === downloadForm.id ? downloadForm : d);
    }
    updateLanding('landing_downloads', updated);
    setDownloadModal({ open: false, mode: 'create', data: null });
  };

  const handleDownloadDelete = () => {
    updateLanding('landing_downloads', downloads.filter(d => d.id !== downloadDelete.id));
    setDownloadDelete({ open: false, id: null, name: '' });
  };

  // Testimonials
  const [testimonialModal, setTestimonialModal] = useState({ open: false, mode: 'create', data: null });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', school: '', quote: '', image: '' });
  const [testimonialDelete, setTestimonialDelete] = useState({ open: false, id: null, name: '' });

  const openTestimonialCreate = () => { setTestimonialForm({ name: '', school: '', quote: '', image: '' }); setTestimonialModal({ open: true, mode: 'create', data: null }); };
  const openTestimonialEdit = (t) => { setTestimonialForm(t); setTestimonialModal({ open: true, mode: 'edit', data: t }); };

  const handleTestimonialSave = () => {
    let updated;
    if (testimonialModal.mode === 'create') {
      updated = [...testimonials, { ...testimonialForm, id: generateId() }];
    } else {
      updated = testimonials.map(t => t.id === testimonialForm.id ? testimonialForm : t);
    }
    updateLanding('landing_testimonials', updated);
    setTestimonialModal({ open: false, mode: 'create', data: null });
  };

  const handleTestimonialDelete = () => {
    updateLanding('landing_testimonials', testimonials.filter(t => t.id !== testimonialDelete.id));
    setTestimonialDelete({ open: false, id: null, name: '' });
  };

  const handleSave = () => onSave({ landing: settings.landing });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero Section */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Hero Section</h2>
        <div className="space-y-4">
          <Input label="Title" value={landing.landing_hero_title || ''} onChange={e => updateLanding('landing_hero_title', e.target.value)} placeholder="Manage Your School with Ease" />
          <Input label="Subtitle" value={landing.landing_hero_subtitle || ''} onChange={e => updateLanding('landing_hero_subtitle', e.target.value)} placeholder="Complete school management..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Text" value={landing.landing_hero_cta_text || ''} onChange={e => updateLanding('landing_hero_cta_text', e.target.value)} placeholder="Get Started" />
            <Input label="CTA Link" value={landing.landing_hero_cta_link || ''} onChange={e => updateLanding('landing_hero_cta_link', e.target.value)} placeholder="/register" />
          </div>
          <Input label="Hero Image URL" value={landing.landing_hero_image || ''} onChange={e => updateLanding('landing_hero_image', e.target.value)} />
          {landing.landing_hero_image && (
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
              <img src={landing.landing_hero_image} alt="Hero preview" className="w-full h-32 object-cover rounded" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Schools" type="number" value={landing.landing_stats_schools || ''} onChange={e => updateLanding('landing_stats_schools', +e.target.value)} />
          <Input label="Students" type="number" value={landing.landing_stats_students || ''} onChange={e => updateLanding('landing_stats_students', +e.target.value)} />
          <Input label="Staff" type="number" value={landing.landing_stats_staff || ''} onChange={e => updateLanding('landing_stats_staff', +e.target.value)} />
        </div>
      </Card>

      {/* Features */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Features</h2>
          <Button size="sm" onClick={openFeatureCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Feature</Button>
        </div>
        {features.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No features added yet.</p>
        ) : (
          <div className="space-y-2">
            {features.sort((a, b) => a.order - b.order).map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{f.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{f.description?.substring(0, 60)}{f.description?.length > 60 ? '...' : ''}</p>
                  </div>
                  {!f.isActive && <span className="text-xs text-[var(--text-muted)]">(Hidden)</span>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openFeatureEdit(f)}><HiPencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="danger" onClick={() => setFeatureDelete({ open: true, id: f.id, title: f.title })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Downloads */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Downloads</h2>
          <Button size="sm" onClick={openDownloadCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Download</Button>
        </div>
        {downloads.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No downloads added yet.</p>
        ) : (
          <div className="space-y-2">
            {downloads.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{d.name} <span className="text-xs text-[var(--text-muted)]">v{d.version}</span></p>
                  <p className="text-xs text-[var(--text-muted)]">{PLATFORMS.find(p => p.value === d.platform)?.label || d.platform} · {d.size}{d.isActive ? '' : ' · Hidden'}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openDownloadEdit(d)}><HiPencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="danger" onClick={() => setDownloadDelete({ open: true, id: d.id, name: d.name })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Testimonials */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Testimonials</h2>
          <Button size="sm" onClick={openTestimonialCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Testimonial</Button>
        </div>
        {testimonials.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No testimonials added yet.</p>
        ) : (
          <div className="space-y-2">
            {testimonials.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t.name} <span className="text-xs text-[var(--text-muted)]">— {t.school}</span></p>
                  <p className="text-xs text-[var(--text-muted)] italic">"{t.quote?.substring(0, 80)}{t.quote?.length > 80 ? '...' : ''}"</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openTestimonialEdit(t)}><HiPencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="danger" onClick={() => setTestimonialDelete({ open: true, id: t.id, name: t.name })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Landing Page</Button>
      </div>

      {/* Feature Modal */}
      <Modal open={featureModal.open} onClose={() => setFeatureModal({ open: false, mode: 'create', data: null })} title={featureModal.mode === 'create' ? 'Add Feature' : 'Edit Feature'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Input label="Icon" value={featureForm.icon} onChange={e => setFeatureForm({ ...featureForm, icon: e.target.value })} placeholder="📚" />
            <div className="col-span-3 flex items-end pb-1">
              <Toggle label="Active" checked={featureForm.isActive} onChange={v => setFeatureForm({ ...featureForm, isActive: v })} />
            </div>
          </div>
          <Input label="Title" value={featureForm.title} onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={featureForm.description} onChange={e => setFeatureForm({ ...featureForm, description: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" />
          </div>
          <Input label="Order" type="number" value={featureForm.order} onChange={e => setFeatureForm({ ...featureForm, order: +e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFeatureModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleFeatureSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Download Modal */}
      <Modal open={downloadModal.open} onClose={() => setDownloadModal({ open: false, mode: 'create', data: null })} title={downloadModal.mode === 'create' ? 'Add Download' : 'Edit Download'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
            <select value={downloadForm.platform} onChange={e => setDownloadForm({ ...downloadForm, platform: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <Input label="Name" value={downloadForm.name} onChange={e => setDownloadForm({ ...downloadForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={downloadForm.version} onChange={e => setDownloadForm({ ...downloadForm, version: e.target.value })} placeholder="1.0.0" />
            <Input label="Size" value={downloadForm.size} onChange={e => setDownloadForm({ ...downloadForm, size: e.target.value })} placeholder="150 MB" />
          </div>
          <Input label="URL" value={downloadForm.url} onChange={e => setDownloadForm({ ...downloadForm, url: e.target.value })} />
          <Input label="Requirements" value={downloadForm.requirements} onChange={e => setDownloadForm({ ...downloadForm, requirements: e.target.value })} placeholder="Windows 10+" />
          <Toggle label="Active" checked={downloadForm.isActive} onChange={v => setDownloadForm({ ...downloadForm, isActive: v })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDownloadModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleDownloadSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Testimonial Modal */}
      <Modal open={testimonialModal.open} onClose={() => setTestimonialModal({ open: false, mode: 'create', data: null })} title={testimonialModal.mode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} required />
            <Input label="School" value={testimonialForm.school} onChange={e => setTestimonialForm({ ...testimonialForm, school: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Quote</label>
            <textarea value={testimonialForm.quote} onChange={e => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" required />
          </div>
          <Input label="Image URL" value={testimonialForm.image} onChange={e => setTestimonialForm({ ...testimonialForm, image: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setTestimonialModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleTestimonialSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmations */}
      <ConfirmDialog open={featureDelete.open} onClose={() => setFeatureDelete({ open: false, id: null, title: '' })} onConfirm={handleFeatureDelete}
        title="Delete Feature" message={`Delete "${featureDelete.title}"?`} confirmLabel="Delete" variant="danger" />
      <ConfirmDialog open={downloadDelete.open} onClose={() => setDownloadDelete({ open: false, id: null, name: '' })} onConfirm={handleDownloadDelete}
        title="Delete Download" message={`Delete "${downloadDelete.name}"?`} confirmLabel="Delete" variant="danger" />
      <ConfirmDialog open={testimonialDelete.open} onClose={() => setTestimonialDelete({ open: false, id: null, name: '' })} onConfirm={handleTestimonialDelete}
        title="Delete Testimonial" message={`Delete "${testimonialDelete.name}"?`} confirmLabel="Delete" variant="danger" />
    </div>
  );
}