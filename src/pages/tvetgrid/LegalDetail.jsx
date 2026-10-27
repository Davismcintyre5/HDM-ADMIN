import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiSave, HiUpload, HiEye } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getLegalDoc,
  updateLegalDoc,
  publishLegalDoc,
} from '../../services/tvetgrid/legal';
import { formatDate } from '../../utils/tvetgrid/formatDate';

export default function LegalDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [effectiveAt, setEffectiveAt] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [confirmPublish, setConfirmPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLegalDoc(slug);
      const d = res?.data || res;
      setDoc(d);
      setTitle(d.title || '');
      setBodyMd(d.bodyMd || '');
      setEffectiveAt(
        d.effectiveAt ? d.effectiveAt.slice(0, 16) : ''
      );
      setIsPublished(!!d.isPublished);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
      navigate('/tvetgrid/legal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateLegalDoc(slug, {
        title: title.trim(),
        bodyMd,
        effectiveAt: effectiveAt || undefined,
        isPublished,
      });
      const updated = res?.data || res;
      if (updated) setDoc(updated);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishLegalDoc(slug);
      const updated = res?.data || res;
      if (updated) {
        setDoc(updated);
        setIsPublished(true);
      }
      toast.success('Published');
      setConfirmPublish(false);
    } catch (err) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/legal')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {doc.title}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">
            /{slug} · v{doc.version}
          </p>
          {doc.updatedAt && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Updated {formatDate(doc.updatedAt, 'full')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isPublished ? 'success' : 'default'} dot>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
          {!isPublished && (
            <Button
              size="sm"
              variant="success"
              icon={<HiUpload className="w-3.5 h-3.5" />}
              onClick={() => setConfirmPublish(true)}
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      <Card title="Content">
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Effective date"
            type="datetime-local"
            value={effectiveAt}
            onChange={(e) => setEffectiveAt(e.target.value)}
            hint="Optional — when this version becomes effective"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Body (Markdown)
            </label>
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm font-mono"
            />
          </div>
          <div className="flex justify-end">
            <Button
              icon={<HiSave className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      {doc.bodyMd && (
        <Card
          title="Preview"
          actions={
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <HiEye className="w-3.5 h-3.5" /> Rendered as text (not markdown)
            </span>
          }
        >
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-mono bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
            {doc.bodyMd}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={handlePublish}
        title="Publish document"
        message={`Publish "${doc.title}"? A new version (v${(doc.version || 1) + 1}) will be created and become public immediately.`}
        confirmLabel="Publish"
        variant="success"
        loading={publishing}
      />
    </div>
  );
}