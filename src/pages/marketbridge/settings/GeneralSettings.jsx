import { useState } from 'react';
import Card from '../../../components/marketbridge/ui/Card';
import Input from '../../../components/marketbridge/ui/Input';
import Button from '../../../components/marketbridge/ui/Button';
import { HiUpload } from 'react-icons/hi';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;
  const [savingSection, setSavingSection] = useState('');

const handleFileUpload = async (e, type) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setSavingSection(type);
  try {
    const api = (await import('../../../services/marketbridge/api')).default;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // 'logo' or 'favicon'
    const res = await api.post('/settings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.data?.data?.url || res.data?.url;
    if (url) {
      setSettings(prev => ({ ...prev, [`system_${type}`]: url }));
    }
    alert(`${type} uploaded!`);
  } catch (e) { alert(e.response?.data?.message || e.message); }
  setSavingSection('');
};
  const handleSaveSection = async (section) => {
    setSavingSection(section);
    const keyMap = {
      identity: ['system_name', 'system_tagline'],
      contact: ['contact_email', 'contact_phone', 'contact_address'],
      social: ['social_facebook', 'social_twitter', 'social_instagram', 'social_tiktok'],
    };
    const keys = keyMap[section] || [];
    for (const key of keys) {
      await onSave(key, settings[key]);
    }
    setSavingSection('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* System Identity */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">System Identity</h2>
        <div className="space-y-4">
          <Input label="System Name" value={getVal('system_name')} onChange={e => setSettings(prev => ({ ...prev, system_name: e.target.value }))} />
          <Input label="Tagline" value={getVal('system_tagline')} onChange={e => setSettings(prev => ({ ...prev, system_tagline: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Logo</label>
              {getVal('system_logo') && <img src={getVal('system_logo')} alt="Logo" className="h-10 rounded mb-2" />}
              <label className="cursor-pointer inline-block px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700">
                <HiUpload className="w-4 h-4 inline mr-1" /> Upload Logo
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Favicon</label>
              {getVal('system_favicon') && <img src={getVal('system_favicon')} alt="Favicon" className="h-6 rounded mb-2" />}
              <label className="cursor-pointer inline-block px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700">
                <HiUpload className="w-4 h-4 inline mr-1" /> Upload Favicon
                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'favicon')} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Name, tagline, logo & favicon</span>
          <Button size="sm" onClick={() => handleSaveSection('identity')} loading={savingSection === 'identity'}>Save Identity</Button>
        </div>
      </Card>

      {/* Contact */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact Information</h2>
        <div className="space-y-4">
          <Input label="Contact Email" type="email" value={getVal('contact_email')} onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))} />
          <Input label="Contact Phone" value={getVal('contact_phone')} onChange={e => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Address</label>
            <textarea value={getVal('contact_address')} onChange={e => setSettings(prev => ({ ...prev, contact_address: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-500 resize-y text-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Email, phone & physical address</span>
          <Button size="sm" onClick={() => handleSaveSection('contact')} loading={savingSection === 'contact'}>Save Contact</Button>
        </div>
      </Card>

      {/* Social Links */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Social Links</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Facebook" value={getVal('social_facebook')} onChange={e => setSettings(prev => ({ ...prev, social_facebook: e.target.value }))} />
          <Input label="Twitter" value={getVal('social_twitter')} onChange={e => setSettings(prev => ({ ...prev, social_twitter: e.target.value }))} />
          <Input label="Instagram" value={getVal('social_instagram')} onChange={e => setSettings(prev => ({ ...prev, social_instagram: e.target.value }))} />
          <Input label="TikTok" value={getVal('social_tiktok')} onChange={e => setSettings(prev => ({ ...prev, social_tiktok: e.target.value }))} />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Facebook, Twitter, Instagram, TikTok</span>
          <Button size="sm" onClick={() => handleSaveSection('social')} loading={savingSection === 'social'}>Save Social</Button>
        </div>
      </Card>
    </div>
  );
}