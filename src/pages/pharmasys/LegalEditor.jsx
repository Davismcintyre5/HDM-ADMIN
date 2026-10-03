import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiSave } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Button from '../../components/pharmasys/ui/Button';
import Input from '../../components/pharmasys/ui/Input';
import Textarea from '../../components/pharmasys/ui/Textarea';
import Spinner from '../../components/pharmasys/ui/Spinner';
import { useToast } from '../../context/pharmasys/ToastContext';
import { publishLegal, getLegalList } from '../../services/pharmasys/legal';
import { LEGAL_TYPES } from '../../utils/pharmasys/constants';

export default function LegalEditor() {
  const { type = 'terms' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  useEffect(() => {
    if (!LEGAL_TYPES.includes(type)) {
      toast.error('Unknown legal type');
      navigate('/pharmasys/legal');
      return;
    }

    let cancelled = false;
    setLoading(true);
    getLegalList()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res || [];
        const versions = (Array.isArray(data) ? data : []).filter(
          (d) => d.type === type
        );
        const current = versions.find((v) => v.isCurrent);
        if (current) {
          setTitle(current.title || '');
          setContent(current.content || '');
          setCurrentVersion(current.version);
        } else {
          setTitle(
            type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
          );
          setContent('');
          setCurrentVersion(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTitle(
            type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const save = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    setSaving(true);
    try {
      await publishLegal({ type, title, content });
      toast.success('New version published');
      navigate('/pharmasys/legal');
    } catch (err) {
      toast.error(err.message || 'Failed to publish');
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
          onClick={() => navigate('/pharmasys/legal')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {type.toUpperCase()} — New version
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {currentVersion
              ? `Publishing will create v${currentVersion + 1}. v${currentVersion} becomes archived.`
              : 'No current version exists. This will be v1.'}
          </p>
        </div>
        <Button
          icon={<HiSave className="w-4 h-4" />}
          onClick={save}
          loading={saving}
        >
          Publish
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Terms of Service"
          />
          <Textarea
            label="Content (Markdown)"
            hint="Supports standard markdown formatting"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={24}
            className="font-mono text-sm"
            placeholder="# Terms of Service&#10;&#10;## 1. Acceptance&#10;..."
          />
        </div>
      </Card>
    </div>
  );
}