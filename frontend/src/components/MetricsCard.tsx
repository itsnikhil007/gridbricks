import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'teal' | 'emerald' | 'amber' | 'rose' | 'zinc';
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
  badgeColor = 'teal',
  trend,
  trendText
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'zinc':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'teal':
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const getIconColor = () => {
    if (trend === 'positive' || badgeColor === 'emerald') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (trend === 'negative' || badgeColor === 'rose') return 'text-rose-700 bg-rose-50 border-rose-200';
    if (trend === 'warning' || badgeColor === 'amber') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (badgeColor === 'zinc') return 'text-zinc-700 bg-zinc-100 border-zinc-200';
    return 'text-teal-700 bg-teal-50 border-teal-200';
  };

  const displayBadge = badge || trendText;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 hover:border-zinc-300 transition shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-950 font-tabular">{value}</span>
            {unit && <span className="text-xs text-zinc-500 font-medium">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-md border ${getIconColor()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {(subtitle || displayBadge) && (
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs gap-2">
          {subtitle && <span className="text-zinc-500 truncate">{subtitle}</span>}
          {displayBadge && (
            <span className={`px-2 py-0.5 rounded-sm border text-[11px] font-medium shrink-0 ${getBadgeStyle()}`}>
              {displayBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
