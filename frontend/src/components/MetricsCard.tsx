import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral' | 'warning';
  trendText?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendText
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'negative':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
            {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${getTrendColor()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trendText) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trendText && (
            <span className={`font-medium ${getTrendColor().split(' ')[0]}`}>
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
