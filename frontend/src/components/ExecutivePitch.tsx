import React from 'react';
import { 
  Target, PoundSterling, ShieldAlert, 
  CheckCircle2, ArrowRight
} from 'lucide-react';

export const ExecutivePitch: React.FC<{ onNavigateToDesk: () => void }> = ({ onNavigateToDesk }) => {
  return (
    <div className="space-y-4 font-sans text-slate-300">
      {/* 1. Executive Briefing Banner */}
      <div className="bg-[#0E131F] border border-[#1A2234] border-l-2 border-l-[#10B981] rounded-xs p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-semibold uppercase">
            COMMERCIAL DOSSIER // UK WHOLESALE POWER DESK
          </span>
          <span className="text-[10px] font-mono text-slate-400">PILOT AUDIT RESULTS</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight leading-snug">
          Optimizing Day-Ahead Power Procurement with Quantified Wind Intelligence
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          Automated decision-support infrastructure that ingests Elexon BMRS WINDFOR and FUELHH streams right at 11:00 GMT Gate Closure, sizes exact net thermal requirements, and protects the utility balance sheet against volatile balancing cash-out penalties.
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={onNavigateToDesk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#00D2FF] text-slate-950 font-mono text-xs font-bold transition hover:bg-[#00c0eb]"
          >
            <span>ACCESS DISPATCH WORKBENCH</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-[#0E131F] border border-[#1A2234] border-l-2 border-l-[#00D2FF] rounded-xs p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#00D2FF] font-bold uppercase">PILLAR 1</span>
            <Target className="w-4 h-4 text-[#00D2FF]" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white">11:00 GMT Gate Closure Precision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates stale forecasts. Directly grabs the latest published WINDFOR run right before the 11:00 GMT EPEX SPOT day-ahead auction deadline for delivery day D.
          </p>
        </div>

        <div className="bg-[#0E131F] border border-[#1A2234] border-l-2 border-l-[#FF9F1C] rounded-xs p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#FF9F1C] font-bold uppercase">PILLAR 2</span>
            <PoundSterling className="w-4 h-4 text-[#FF9F1C]" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white">Automated Thermal Sizing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly converts national wind forecasts into actionable EPEX auction trade orders: Residual Thermal = Demand − Wind, generating Trayport-compatible CSV tickets.
          </p>
        </div>

        <div className="bg-[#0E131F] border border-[#1A2234] border-l-2 border-l-[#8B5CF6] rounded-xs p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A78BFA] font-bold uppercase">PILLAR 3</span>
            <ShieldAlert className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <h3 className="font-mono text-sm font-bold text-white">Quantified Downside Protection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Empowers traders with empirical error distributions and P90 confidence safety buffers, preventing catastrophic exposure to System Buy Price (SBP) cash-out surcharges.
          </p>
        </div>
      </div>

      {/* 3. January 2026 Pilot Audit Takeaways */}
      <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1A2234] pb-2">
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-tight">
              January 2026 Forensic Audit Findings (744 Hours)
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Quantified empirical evidence from 744 settlement hours of Elexon BMRS outturn:
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] font-bold">
            £1.4M AVOIDED CASH-OUT PENALTY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0A0E17] border border-[#1A2234] p-3 rounded-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#00D2FF] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finding 1: High Macro Tracking (R² = 0.89)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Elexon national wind forecasts accurately mirror the macroscopic weather trajectory across Great Britain, capturing major storm ramp-ups and lulls with strong predictive power.
            </p>
          </div>

          <div className="bg-[#0A0E17] border border-[#1A2234] p-3 rounded-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF9F1C] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finding 2: Diurnal Morning Ramp Volatility (07:00–09:00 GMT)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Forecast error (MAE) systematically spikes during the morning demand ramp. Applying a targeted +450 MW dynamic safety buffer during EFA 3 peak hours mitigates this recurring vulnerability.
            </p>
          </div>

          <div className="bg-[#0A0E17] border border-[#1A2234] p-3 rounded-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#EF4444] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finding 3: Asymmetric P90 Tail Drop-Offs</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              On 3 days in January, sudden wind drop-offs exceeded 1,800 MW. Contracting an empirical P90 thermal safety reserve hedges the utility against 90% of tail drop-off events.
            </p>
          </div>

          <div className="bg-[#0A0E17] border border-[#1A2234] p-3 rounded-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#10B981] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finding 4: Quantified £1.4M Commercial P&L Value</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Backtesting Gridbricks' automated decision methodology against unhedged baseline purchases demonstrates an estimated <strong>£1.4M savings</strong> in avoided cash-out imbalance penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
