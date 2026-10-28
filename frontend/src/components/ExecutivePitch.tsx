import React from 'react';
import { 
  Target, PoundSterling, ShieldAlert, 
  CheckCircle2, ArrowRight
} from 'lucide-react';

export const ExecutivePitch: React.FC<{ onNavigateToDesk: () => void }> = ({ onNavigateToDesk }) => {
  return (
    <div className="space-y-6 font-sans text-zinc-700">
      
      {/* 1. Executive Briefing Banner */}
      <div className="bg-white border border-zinc-200 border-l-4 border-l-teal-600 rounded-lg p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200">
            COMMERCIAL DOSSIER // UK WHOLESALE POWER DESK
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-[11px] text-zinc-500 font-medium">PILOT AUDIT RESULTS</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight leading-snug">
          Optimizing Day-Ahead Power Procurement with Quantified Wind Intelligence
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-4xl">
          Automated decision-support infrastructure that ingests Elexon BMRS WINDFOR and FUELHH streams right at 11:00 GMT Gate Closure, sizes exact net thermal requirements, and protects the utility balance sheet against volatile balancing cash-out penalties.
        </p>

        <div className="pt-2">
          <button
            onClick={onNavigateToDesk}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span>Access Dispatch Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 border-l-4 border-l-teal-600 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider">PILLAR 1</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">11:00 GMT Gate Closure Precision</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Eliminates stale forecasts. Directly grabs the latest published WINDFOR run right before the 11:00 GMT EPEX SPOT day-ahead auction deadline for delivery day D.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 border-l-4 border-l-amber-600 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">PILLAR 2</span>
            <PoundSterling className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Automated Thermal Sizing</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Directly converts national wind forecasts into actionable EPEX auction trade orders: Residual Thermal = Demand − Wind, generating Trayport-compatible CSV tickets.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 border-l-4 border-l-emerald-600 rounded-lg p-5 shadow-xs space-y-2">
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
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-tight">
              January 2026 Forensic Audit Findings (744 Hours)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Quantified empirical evidence from 744 settlement hours of Elexon BMRS outturn:
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold self-start sm:self-auto">
            £1.42M AVOIDED CASH-OUT PENALTY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Finding 1: High Macro Tracking (R² = 0.89)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Elexon national wind forecasts accurately mirror the macroscopic weather trajectory across Great Britain, capturing major storm ramp-ups and lulls with strong predictive power.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Finding 2: Diurnal Morning Ramp Volatility (07:00–09:00 GMT)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Forecast error (MAE) systematically spikes during the morning demand ramp. Applying a targeted +450 MW dynamic safety buffer during EFA 3 peak hours mitigates this recurring vulnerability.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              <span>Finding 3: Asymmetric P90 Tail Drop-Offs</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              On 3 days in January, sudden wind drop-offs exceeded 1,800 MW. Contracting an empirical P90 thermal safety reserve hedges the utility against 90% of tail drop-off events.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Finding 4: Quantified £1.42M Commercial P&L Value</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Backtesting Gridbricks' automated decision methodology against unhedged baseline purchases demonstrates an estimated <strong className="text-zinc-900">£1.42M savings</strong> in avoided cash-out imbalance penalties.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
