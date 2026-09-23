import { Link } from 'react-router-dom';
import { HiShieldExclamation } from 'react-icons/hi';
import Button from '../../components/smartpos/ui/Button';

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <HiShieldExclamation className="w-12 h-12 text-[var(--text-muted)] mb-4" />
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Access denied</h1>
      <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md">
        You don't have permission to view this page.
      </p>
      <Link to="/smartpos" className="mt-6">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}