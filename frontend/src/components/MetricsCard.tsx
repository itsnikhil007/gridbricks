import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  trend?: string;
  trendText?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  trend,
  trendText
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'slate':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  const getIconColor = () => {
    if (trend === 'positive' || badgeColor === 'emerald') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (trend === 'negative' || badgeColor === 'rose') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (trend === 'warning' || badgeColor === 'amber') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  };

  const displayBadge = badge || trendText;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
            {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl border ${getIconColor()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || displayBadge) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {displayBadge && (
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium shrink-0 ${getBadgeStyle()}`}>
              {displayBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
