import { Link, useNavigate } from 'react-router-dom';
import { HiShieldExclamation, HiArrowLeft, HiHome } from 'react-icons/hi';
import Button from '../../components/pharmasys/ui/Button';
import Card from '../../components/pharmasys/ui/Card';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <HiShieldExclamation className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>

          <p className="text-5xl font-bold text-[var(--text-primary)] mb-2">
            403
          </p>

          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Access denied
          </h1>

          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xs">
            You don't have permission to view this page. If you believe this is
            a mistake, contact your platform administrator.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
            <Button
              variant="outline"
              icon={<HiArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(-1)}
              fullWidth
            >
              Go back
            </Button>
            <Link to="/pharmasys" className="w-full">
              <Button
                icon={<HiHome className="w-4 h-4" />}
                fullWidth
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}