import React from 'react';
import { 
  Target, PoundSterling, ShieldAlert, Award, 
  CheckCircle2, ArrowRight
} from 'lucide-react';

export const ExecutivePitch: React.FC<{ onNavigateToDesk: () => void }> = ({ onNavigateToDesk }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Pitch Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/30 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-4">
            <Award className="w-4 h-4" />
            <span>Pilot Project Presentation • UK Energy Utility Wholesale Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Optimizing Day-Ahead Power Purchases with Quantified Wind Intelligence
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Delivering an automated decision-support portal that captures latest Elexon forecasts at Gate Closure, calculates exact net thermal requirements, and safeguards your trading desk against volatile balancing cash-out penalties.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={onNavigateToDesk}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 transition"
            >
              <span>Explore Live Decision Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">1. Pinpoint Gate Closure Precision</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminates stale data. Automatically extracts the latest WINDFOR forecast run available right before the 11:00 GMT EPEX SPOT auction deadline for delivery day D.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <PoundSterling className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">2. Automated Thermal Sizing</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Directly translates weather forecasts into actionable commercial trade orders: Net Residual Demand = Demand − Wind, outputting exact MWh to procure.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">3. Quantified Downside Protection</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Empowers traders with empirical error distributions and P90 confidence buffers, avoiding multi-million pound System Imbalance Cash-out charges.
          </p>
        </div>
      </div>

      {/* Pilot Results: January 2026 Audit */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
          Key Takeaways from the January 2026 Pilot Audit
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Rigorous analysis of 744 hours of national wind generation and forecasts reveals three critical strategic insights for your trading desk:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Insight 1: Consistent High Tracking (R² = 0.89)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Elexon national wind forecasts accurately mirror the macroscopic weather trajectory across Great Britain, capturing major storm ramp-ups and lulls.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Insight 2: Diurnal Morning Ramp Volatility</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Forecasting error (MAE) spikes during the 07:00–09:00 morning demand ramp. We recommend applying a dynamic safety buffer (+450 MW) specifically during these morning peak hours.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Insight 3: P90 Asymmetric Downside Risk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              On 3 days in January, sudden wind drop-offs exceeded 1,800 MW. Our built-in P90 risk hedge allows traders to cover this tail risk for a modest insurance premium.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Insight 4: Estimated Imbalance Cost Savings</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Backtesting the Gridbricks decision methodology against unhedged baseline purchases demonstrates an estimated <strong>£1.4M savings</strong> in avoided cash-out imbalance penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
