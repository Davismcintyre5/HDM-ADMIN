import { useState, useEffect } from 'react';
import { getUploadSettings, updateUploadSettings } from '../../../services/rvnp/settings';
import Button from '../../../components/rvnp/ui/Button';
import Spinner from '../../../components/rvnp/ui/Spinner';
import { HiUpload, HiPhotograph, HiFilm } from 'react-icons/hi';

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const DEFAULT_SETTINGS = {
  maxFileSize: 200,
  maxImages: 10,
  maxVideos: 1,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  provider: 'cloudinary',
};

export default function UploadSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getUploadSettings();
      const data = res?.data || res || {};
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
    } catch {
      setError('Failed to load upload settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await updateUploadSettings(settings);
      const data = res?.data || settings;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
      setSuccess('Upload settings saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleImageType = (type) => {
    setSettings((prev) => {
      const current = prev?.allowedImageTypes || DEFAULT_SETTINGS.allowedImageTypes;
      if (current.includes(type)) {
        return { ...prev, allowedImageTypes: current.filter((t) => t !== type) };
      }
      return { ...prev, allowedImageTypes: [...current, type] };
    });
  };

  const toggleVideoType = (type) => {
    setSettings((prev) => {
      const current = prev?.allowedVideoTypes || DEFAULT_SETTINGS.allowedVideoTypes;
      if (current.includes(type)) {
        return { ...prev, allowedVideoTypes: current.filter((t) => t !== type) };
      }
      return { ...prev, allowedVideoTypes: [...current, type] };
    });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Max File Size */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiUpload className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">File Size Limit</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 0 })}
            min={1}
            max={500}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-emerald-600"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Maximum size for a single file upload (videos included)
          </p>
        </div>
      </div>

      {/* Image Limits */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiPhotograph className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">Image Uploads</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Max Images per Upload
          </label>
          <input
            type="number"
            value={settings.maxImages}
            onChange={(e) => setSettings({ ...settings, maxImages: parseInt(e.target.value) || 0 })}
            min={1}
            max={20}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Allowed Image Types
          </label>
          <div className="space-y-2">
            {IMAGE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings.allowedImageTypes || []).includes(type)}
                  onChange={() => toggleImageType(type)}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-[var(--text-primary)]">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Video Limits */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiFilm className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">Video Uploads</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Max Videos per Upload
          </label>
          <input
            type="number"
            value={settings.maxVideos}
            onChange={(e) => setSettings({ ...settings, maxVideos: parseInt(e.target.value) || 0 })}
            min={1}
            max={5}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Allowed Video Types
          </label>
          <div className="space-y-2">
            {VIDEO_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings.allowedVideoTypes || []).includes(type)}
                  onChange={() => toggleVideoType(type)}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-[var(--text-primary)]">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Provider */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiUpload className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">Storage Provider</h3>
        </div>

        <select
          value={settings.provider}
          onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-emerald-600"
        >
          <option value="cloudinary">Cloudinary</option>
          <option value="local">Local Storage</option>
        </select>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} loading={saving} className="w-full">
        Save Upload Settings
      </Button>
    </div>
  );
}