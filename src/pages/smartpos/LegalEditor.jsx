import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiSave } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Textarea from '../../components/smartpos/ui/Textarea';
import Spinner from '../../components/smartpos/ui/Spinner';
import { useToast } from '../../context/smartpos/ToastContext';
import { getLegalCurrent, publishLegal } from '../../services/smartpos/legal';

export default function LegalEditor() {
  const { type = 'terms' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLegalCurrent(type)
      .then((res) => {
        if (cancelled) return;
        const doc = res?.data || res;
        setTitle(doc?.title || '');
        setContent(doc?.content || '');
      })
      .catch(() => {
        if (!cancelled) {
          setTitle(type.charAt(0).toUpperCase() + type.slice(1));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const save = async () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    setSaving(true);
    try {
      await publishLegal(type, { title, content });
      toast.success('New version published');
      navigate('/smartpos/legal');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/smartpos/legal')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {type.toUpperCase()} — New version
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Publishing creates a new immutable version. The previous version is archived.
          </p>
        </div>
        <Button icon={<HiSave className="w-4 h-4" />} onClick={save} loading={saving}>
          Publish
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            label="Content (Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={24}
            className="font-mono text-sm"
          />
        </div>
      </Card>
    </div>
  );
}