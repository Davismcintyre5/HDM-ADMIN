import { Link } from 'react-router-dom';
import { HiQuestionMarkCircle } from 'react-icons/hi';
import Button from '../../components/smartpos/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <HiQuestionMarkCircle className="w-12 h-12 text-[var(--text-muted)] mb-4" />
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/smartpos" className="mt-6">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}