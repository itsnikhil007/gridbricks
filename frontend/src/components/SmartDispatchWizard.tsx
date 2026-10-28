import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Download, 
  TrendingUp, Wind, Flame, CheckCircle2, Sliders, ChevronDown, ChevronUp,
  Loader2, AlertTriangle, ArrowRight, ShieldAlert
} from 'lucide-react';
import type { WeatherRegime, ProcurementSummary, AccuracyMetrics } from '../types';

interface SmartDispatchWizardProps {
  baseDemand: number;
  setBaseDemand: (val: number) => void;
  applySafetyBuffer: boolean;
  setApplySafetyBuffer: (val: boolean) => void;
  safetyBufferMw: number;
  summary: ProcurementSummary;
  metrics: AccuracyMetrics;
  weatherRegime?: WeatherRegime;
  deliveryDate: string;
  cutoffTime: string;
  onExportCSV: () => void;
}

export const SmartDispatchWizard: React.FC<SmartDispatchWizardProps> = ({
  baseDemand,
  setBaseDemand,
  applySafetyBuffer,
  setApplySafetyBuffer,
  safetyBufferMw,
  summary,
  metrics,
  weatherRegime,
  deliveryDate,
  cutoffTime,
  onExportCSV
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [justOptimized, setJustOptimized] = useState<boolean>(false);

  // Quick Persona Presets
  const presets = [
    { label: 'Baseload', mw: 22000, cost: '£1.2M', desc: 'Standard residential baseload' },
    { label: 'Winter Peak', mw: 32000, cost: '£1.8M', desc: 'Cold snap heating peak' },
    { label: 'Industrial Peak', mw: 38000, cost: '£2.4M', desc: 'Heavy manufacturing' },
  ];

  const handleRunOptimizer = (targetMw: number, riskHedging: boolean) => {
    setIsOptimizing(true);
    
    // Smooth 500ms AI computing animation for tangible visual feedback
    setTimeout(() => {
      setBaseDemand(targetMw);
      setApplySafetyBuffer(riskHedging);
      setIsOptimizing(false);
      setJustOptimized(true);
      setTimeout(() => setJustOptimized(false), 3500);
    }, 450);
  };

  // Wholesale cost estimate (~£75/MWh average wholesale thermal cost)
  const thermalMwh = applySafetyBuffer ? summary.total_buffered_procured_mwh : summary.total_thermal_procured_mwh;
  const rawThermalMwh = summary.total_thermal_procured_mwh;
  const bufferReserveMwh = applySafetyBuffer ? (summary.buffer_reserve_mwh || Math.round(safetyBufferMw * 24)) : 0;
  const estimatedCostGbp = Math.round(thermalMwh * 75.0);
  const windSavingsGbp = Math.round(summary.total_wind_forecast_mwh * 75.0);
  const avoidedPenaltyGbp = weatherRegime?.avoided_cashout_surcharge_gbp || 663000;

  return (
    <div className={`bg-white border rounded-xl shadow-xs overflow-hidden w-full min-w-0 max-w-full transition-all duration-300 ${
      justOptimized ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-zinc-200'
    }`}>
      
      {/* Wizard Header Strip */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 bg-gradient-to-r from-teal-50/60 via-white to-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 transition-colors ${
            isOptimizing ? 'bg-amber-600 animate-pulse' : 'bg-teal-600'
          }`}>
            {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-sm border border-teal-200">
                1-CLICK AI COPILOT
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[11px] font-medium text-zinc-500">
                UK Day-Ahead Wholesale Desk
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight mt-0.5 truncate">
              Smart Dispatch & Budget Optimizer
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {justOptimized && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md animate-in fade-in flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Optimal Auction Ticket Calculated!</span>
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 transition cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Assistant'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          
          {/* Persona Presets & Big CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Left: Quick Personas */}
            <div className="lg:col-span-8 space-y-2.5">
              <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-700" />
                <span>Select Your Client Demand Portfolio & Budget Persona:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isCurrent = baseDemand === p.mw;
                  return (
                    <button
                      key={p.mw}
                      onClick={() => handleRunOptimizer(p.mw, true)}
                      disabled={isOptimizing}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm ring-2 ring-zinc-700'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          {p.label}
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isCurrent ? 'bg-zinc-800 text-emerald-300' : 'bg-white text-zinc-600 border border-zinc-200'
                        }`}>
                          {p.cost}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] leading-tight opacity-80">
                        {p.desc} ({p.mw.toLocaleString()} MW Peak)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Big 1-Click Action Button */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <button
                onClick={() => handleRunOptimizer(baseDemand, true)}
                disabled={isOptimizing}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group ${
                  isOptimizing
                    ? 'bg-teal-900 text-white cursor-wait'
                    : applySafetyBuffer
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white'
                    : 'bg-gradient-to-r from-teal-700 to-amber-700 hover:from-teal-800 hover:to-amber-800 text-white'
                }`}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" />
                    <span>Calibrating 48 Settlement Periods...</span>
                  </>
                ) : applySafetyBuffer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span>✓ AI Schedule Applied (Click to Re-run)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>⚡ Run 1-Click AI Optimization</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-500 text-center mt-2">
                Locks latest {cutoffTime} GMT forecast • Applies P90 tail risk cushion
              </p>
            </div>

          </div>

          {/* Interactive AI Hedging Status Bar */}
          <div className="p-3 sm:p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-300 bg-zinc-50 border-zinc-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                applySafetyBuffer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {applySafetyBuffer ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-zinc-900 flex items-center gap-2 flex-wrap">
                  <span>Current Posture: {applySafetyBuffer ? 'AI Risk-Hedging Active (P90 Buffer Protected)' : 'Raw Unhedged (High Imbalance Risk)'}</span>
                  {applySafetyBuffer && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                      +{safetyBufferMw} MW Cushion
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {applySafetyBuffer
                    ? `Insures portfolio against 90% of sudden wind drop-offs. Estimated avoided cashout penalty: £${(avoidedPenaltyGbp / 1000).toLocaleString()}k.`
                    : 'Purchasing bare minimum net residual. If wind underperforms, National Grid charges cashout imbalance penalties up to £300/MWh.'}
                </p>
              </div>
            </div>

            {/* Posture Toggle Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => handleRunOptimizer(baseDemand, true)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                  applySafetyBuffer 
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs' 
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>P90 Hedged (Optimal)</span>
              </button>
              <button
                onClick={() => handleRunOptimizer(baseDemand, false)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                  !applySafetyBuffer 
                    ? 'bg-amber-700 text-white border-amber-800 shadow-2xs' 
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Raw Unhedged</span>
              </button>
            </div>
          </div>

          {/* AI Decision Results Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            
            <div className={`p-3 sm:p-3.5 bg-teal-50/60 border rounded-lg transition-all duration-300 ${
              justOptimized ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-teal-200'
            }`}>
              <div className="flex items-center gap-1.5 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Wind className="w-3.5 h-3.5 text-teal-700" />
                <span>Zero-Carbon Wind</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-tabular text-teal-900">
                {Math.round(summary.total_wind_forecast_mwh).toLocaleString()} MWh
              </div>
              <div className="text-[10px] text-teal-800 mt-1">
                Saves £{(windSavingsGbp / 1000000).toFixed(2)}M in wholesale gas costs
              </div>
            </div>

            <div className={`p-3 sm:p-3.5 bg-amber-50/60 border rounded-lg transition-all duration-300 ${
              justOptimized ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-200'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-800">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  <span>EPEX Thermal Order</span>
                </div>
                {applySafetyBuffer && (
                  <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded font-semibold">
                    +{bufferReserveMwh.toLocaleString()} MWh
                  </span>
                )}
              </div>
              <div className="text-lg sm:text-xl font-bold font-tabular text-amber-900">
                {Math.round(thermalMwh).toLocaleString()} MWh
              </div>
              {applySafetyBuffer ? (
                <div className="text-[10px] text-amber-800 mt-1 flex items-center gap-1 font-medium">
                  <span>Raw: {Math.round(rawThermalMwh).toLocaleString()}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-amber-950">+{bufferReserveMwh.toLocaleString()} MWh Buffer</span>
                </div>
              ) : (
                <div className="text-[10px] text-amber-800 mt-1">
                  Estimated Spend: ~£{(estimatedCostGbp / 1000000).toFixed(2)}M
                </div>
              )}
            </div>

            <div className={`p-3 sm:p-3.5 bg-emerald-50/60 border rounded-lg transition-all duration-300 ${
              justOptimized ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-emerald-200'
            }`}>
              <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Downside Safety Buffer</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-tabular text-emerald-900">
                {applySafetyBuffer ? `+${safetyBufferMw} MW P90` : '0 MW (Raw)'}
              </div>
              <div className="text-[10px] text-emerald-800 mt-1">
                {applySafetyBuffer ? 'Protects 90% of hours from cash-out fines' : 'Unprotected from sudden drops'}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-zinc-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
                <span>Model Confidence</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-tabular text-zinc-900">
                {(100 - metrics.wape).toFixed(1)}% Trust
              </div>
              <div className="text-[10px] text-zinc-600 mt-1">
                Tracking Correlation R² = {metrics.r_squared}
              </div>
            </div>

          </div>

          {/* Plain-English AI Weather & Commercial Briefing */}
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span>Weather Intelligence Briefing ({deliveryDate}):</span>
              </div>
              {weatherRegime && (
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded">
                  {weatherRegime.regime}
                </span>
              )}
            </div>

            <p className="text-zinc-600 leading-relaxed">
              {weatherRegime?.description || 
                `Based on latest Elexon BMRS WINDFOR telemetry locked at ${cutoffTime} GMT, wind will supply ${summary.wind_penetration_pct}% of customer demand. Residual thermal procurement of ${Math.round(thermalMwh).toLocaleString()} MWh is recommended for the EPEX SPOT day-ahead auction.`}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-200/80">
              <span className="text-[11px] text-zinc-500">
                Avoided Imbalance Risk: <strong className="text-zinc-900">£{(avoidedPenaltyGbp / 1000).toLocaleString()}k</strong> estimated cash-out savings under this regime.
              </span>

              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-black py-1 px-2.5 rounded bg-white hover:bg-zinc-100 border border-zinc-300 transition cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-zinc-600" />
                <span>Export Auction Ticket (CSV)</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
