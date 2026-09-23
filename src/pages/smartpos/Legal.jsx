import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiDocumentText, HiPlus } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import { getLegalList } from '../../services/smartpos/legal';
import { formatDate } from '../../utils/smartpos/formatDate';
import { LEGAL_TYPES } from '../../utils/smartpos/constants';

export default function Legal() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLegalList()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setDocs(data && typeof data === 'object' ? data : {});
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Legal documents
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Versioned policies. Published versions are immutable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEGAL_TYPES.map((type) => {
          const versions = Array.isArray(docs[type]) ? docs[type] : [];
          const current = versions.find((v) => v.isCurrent);
          return (
            <Card key={type} title={type.toUpperCase()}>
              <div className="space-y-3">
                {current ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" dot>
                        Published
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        v{current.version}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {current.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Effective{' '}
                      {current.effectiveAt ? formatDate(current.effectiveAt) : '—'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="default">Not published</Badge>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      No current version
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<HiDocumentText className="w-4 h-4" />}
                    onClick={() => navigate(`/smartpos/legal/${type}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    icon={<HiPlus className="w-4 h-4" />}
                    onClick={() => navigate(`/smartpos/legal/${type}`)}
                  >
                    New version
                  </Button>
                </div>

                {versions.length > 1 && (
                  <p className="text-xs text-[var(--text-muted)] pt-2">
                    {versions.length} versions on file
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}