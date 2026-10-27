import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral' | 'warning' | 'wind' | 'hedge';
  trendText?: string;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendText,
  className = ''
}) => {
  const getBorderColor = () => {
    switch (trend) {
      case 'positive':
        return 'border-l-[#10B981]';
      case 'negative':
        return 'border-l-[#EF4444]';
      case 'warning':
        return 'border-l-[#FF9F1C]';
      case 'hedge':
        return 'border-l-[#8B5CF6]';
      case 'wind':
        return 'border-l-[#00D2FF]';
      default:
        return 'border-l-[#00D2FF]';
    }
  };

  const getBadgeColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25';
      case 'negative':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25';
      case 'warning':
        return 'text-[#FF9F1C] bg-[#FF9F1C]/10 border-[#FF9F1C]/25';
      case 'hedge':
        return 'text-[#A78BFA] bg-[#8B5CF6]/10 border-[#8B5CF6]/25';
      case 'wind':
        return 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/25';
      default:
        return 'text-slate-300 bg-slate-800/40 border-slate-700/50';
    }
  };

  return (
    <div
      className={`bg-[#0E131F] border border-[#1A2234] border-l-2 ${getBorderColor()} rounded-sm p-3.5 flex flex-col justify-between hover:bg-[#151C2C]/50 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-medium">
          {title}
        </span>
        {Icon && (
          <Icon className="w-3.5 h-3.5 text-slate-400 opacity-80 flex-shrink-0" />
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono tabular-nums text-xl lg:text-2xl font-bold text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trendText) && (
        <div className="mt-2 pt-2 border-t border-[#1A2234]/70 flex items-center justify-between text-[11px] gap-2">
          {subtitle && (
            <span className="text-slate-400 truncate text-[10px] font-sans">
              {subtitle}
            </span>
          )}
          {trendText && (
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded-xs border flex-shrink-0 ${getBadgeColor()}`}
            >
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
