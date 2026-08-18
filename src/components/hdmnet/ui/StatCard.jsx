import Card from './Card';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

export default function StatCard({ icon: Icon, label, value, change, color = 'text-cyan-500' }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? <HiTrendingUp className="w-4 h-4 text-green-500" /> : <HiTrendingDown className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{change >= 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${color}`} />}
      </div>
    </Card>
  );
}