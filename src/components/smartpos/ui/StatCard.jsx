import Card from './Card';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  hint,
  color = 'text-blue-500',
  className = '',
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 truncate">
            {value}
          </p>
          {(change !== undefined || hint) && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              {change !== undefined && (
                <>
                  {change >= 0 ? (
                    <HiTrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <HiTrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {change >= 0 ? '+' : ''}
                    {change}%
                  </span>
                </>
              )}
              {hint && <span className="text-[var(--text-muted)]">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${color} shrink-0`} />}
      </div>
    </Card>
  );
}