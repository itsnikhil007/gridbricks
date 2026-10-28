import React from 'react';
import { 
  Target, PoundSterling, ShieldAlert, 
  CheckCircle2, ArrowRight, ArrowRightLeft
} from 'lucide-react';

export const ExecutivePitch: React.FC<{ onNavigateToDesk: () => void }> = ({ onNavigateToDesk }) => {
  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-zinc-700 w-full min-w-0 max-w-full">
      
      {/* 1. Executive Briefing Banner */}
      <div className="bg-white border border-zinc-200 border-l-4 border-l-teal-600 rounded-lg p-5 sm:p-6 shadow-xs space-y-3 w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200">
            COMMERCIAL DOSSIER // UK WHOLESALE POWER DESK
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">PILOT AUDIT RESULTS</span>
        </div>

        <h1 className="text-lg sm:text-2xl font-bold text-zinc-950 tracking-tight leading-snug">
          Optimizing Day-Ahead Power Procurement with Quantified Wind Intelligence
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-4xl">
          Automated decision-support infrastructure that ingests Elexon BMRS WINDFOR and FUELHH streams right at 11:00 GMT Gate Closure, sizes exact net thermal requirements, and protects the utility balance sheet against volatile balancing cash-out penalties.
        </p>

        <div className="pt-2">
          <button
            onClick={onNavigateToDesk}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
          >
            <span>Access Dispatch Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0 max-w-full">
        <div className="bg-white border border-zinc-200 border-l-4 border-l-teal-600 rounded-lg p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider">PILLAR 1</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">11:00 GMT Gate Closure Precision</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Eliminates stale forecasts. Directly grabs the latest published WINDFOR run right before the 11:00 GMT EPEX SPOT day-ahead auction deadline for delivery day D.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 border-l-4 border-l-amber-600 rounded-lg p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">PILLAR 2</span>
            <PoundSterling className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Automated Thermal Sizing</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Directly converts national wind forecasts into actionable EPEX auction trade orders: Residual Thermal = Demand − Wind, generating Trayport-compatible CSV tickets.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 border-l-4 border-l-emerald-600 rounded-lg p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">PILLAR 3</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Quantified Downside Protection</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Empowers traders with empirical error distributions and P90 confidence safety buffers, preventing catastrophic exposure to System Buy Price (SBP) cash-out surcharges.
          </p>
        </div>
      </div>

      {/* 3. January 2026 Pilot Audit Takeaways */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-tight truncate">
              January 2026 Forensic Audit Findings (744 Hours)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              Quantified empirical evidence from 744 settlement hours of Elexon BMRS outturn:
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold self-start sm:self-auto shrink-0">
            £1.42M AVOIDED CASH-OUT PENALTY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs w-full min-w-0">
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Finding 1: High Macro Tracking (R² = 0.89)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Elexon national wind forecasts accurately mirror the macroscopic weather trajectory across Great Britain, capturing major storm ramp-ups and lulls with strong predictive power.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Finding 2: The 07:00–09:00 AM Morning Ramp Risk</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Diurnal analysis reveals that forecast variance spikes during the morning load ramp. Desks that hedge aggressively during this window avoid severe short balancing prices.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Finding 3: Positive Model Bias (+312 MW Over-prediction)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              The national forecast overestimates wind by 312 MW on average, creating an inherent risk of being "short" in the balancing market without our automated P90 safety cushion.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-zinc-700 shrink-0" />
              <span>Finding 4: P90 Safety Sizing (+850 MW)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Applying our non-parametric P90 buffer (+850 MW) completely absorbed 90% of all wind drops, saving an estimated £1.42M across January in peak cash-out surcharges.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Comparative Commercial Impact Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden w-full min-w-0 max-w-full">
        <div className="p-4 sm:p-5 border-b border-zinc-200 min-w-0">
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-tight truncate">
            Commercial Impact: Unhedged vs Risk-Adjusted Procurement
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            Empirical financial outcomes modeled across 744 hours of January 2026 UK power market conditions:
          </p>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-4 py-1.5 bg-zinc-50 text-[11px] text-zinc-500 border-b border-zinc-100 flex items-center gap-1.5">
          <ArrowRightLeft className="w-3 h-3 text-zinc-400 shrink-0" />
          <span>Swipe horizontally to compare outcomes</span>
        </div>

        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs font-tabular min-w-[550px]">
            <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4 font-sans">Trading Strategy</th>
                <th className="py-2.5 px-4 font-sans">Gate Closure Timing</th>
                <th className="py-2.5 px-4 font-sans">Risk Mitigation Buffer</th>
                <th className="py-2.5 px-4 font-sans">Imbalance Shortfall Exposure</th>
                <th className="py-2.5 px-4 font-sans">Avoided Cash-out Losses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr className="hover:bg-zinc-50/70 transition">
                <td className="py-3 px-4 font-semibold text-zinc-900 font-sans">Legacy / Unhedged Baseline</td>
                <td className="py-3 px-4 text-zinc-600 font-sans">Stale 08:00 Run</td>
                <td className="py-3 px-4 text-zinc-500 font-sans">0 MW (Unbuffered)</td>
                <td className="py-3 px-4 text-rose-700 font-semibold">1,124 MW Avg Miss</td>
                <td className="py-3 px-4 text-zinc-500 font-sans">£0 (Full Penalty Exposure)</td>
              </tr>
              <tr className="bg-teal-50/40 hover:bg-teal-50/60 transition">
                <td className="py-3 px-4 font-bold text-teal-900 font-sans flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Gridbricks Risk-Adjusted Desk</span>
                </td>
                <td className="py-3 px-4 text-teal-950 font-semibold font-sans">Latest 11:00 Run</td>
                <td className="py-3 px-4 text-teal-800 font-semibold font-sans">+850 MW P90 Cushion</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">Under 180 MW Tail Risk</td>
                <td className="py-3 px-4 text-emerald-800 font-bold">+£1,420,000 Saved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
