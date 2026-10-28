import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Wind, Flame, ShieldAlert, Award, Sliders, Download, Eye,
  CheckCircle2, Info, Activity, Calendar
} from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import type {
  DecisionDateOption,
  DayAheadForecastResponse,
  ForecastEvolutionRun
} from '../types';
import { getLatestForecast, getForecastEvolution } from '../services/api';

interface DecisionDeskProps {
  dates: DecisionDateOption[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  cutoffTime: string;
}

export const DecisionDesk: React.FC<DecisionDeskProps> = ({
  dates,
  selectedDate,
  setSelectedDate,
  cutoffTime
}) => {
  const [data, setData] = useState<DayAheadForecastResponse | null>(null);
  const [evolutionRuns, setEvolutionRuns] = useState<ForecastEvolutionRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simple Decision Controls
  const [baseDemand, setBaseDemand] = useState<number>(32000);
  const [applySafetyBuffer, setApplySafetyBuffer] = useState<boolean>(false);
  const [safetyBufferMw, setSafetyBufferMw] = useState<number>(850);
  const [showActuals, setShowActuals] = useState<boolean>(false);
  const [showEvolution, setShowEvolution] = useState<boolean>(false);

  // Load forecast data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const buffer = applySafetyBuffer ? safetyBufferMw : 0;
        const resp = await getLatestForecast({
          decision_date: selectedDate,
          cutoff_time: cutoffTime,
          base_demand_mw: baseDemand,
          profile_type: 'winter_peak',
          p90_buffer_mw: buffer
        });
        if (isMounted) {
          setData(resp);
          if (resp.metrics.p90_error > 0) {
            setSafetyBufferMw(Math.round(resp.metrics.p90_error));
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load forecast data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedDate, cutoffTime, baseDemand, applySafetyBuffer, safetyBufferMw]);

  // Load forecast evolution when enabled
  useEffect(() => {
    if (!showEvolution || !data) return;
    async function loadEvolution() {
      try {
        const runs = await getForecastEvolution(data!.decision_date, data!.delivery_date);
        setEvolutionRuns(runs);
      } catch (err) {
        console.error('Failed to load evolution runs', err);
      }
    }
    loadEvolution();
  }, [showEvolution, data]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Hour,Target Time,Customer Demand (MW),Expected Wind (MW),Thermal Power To Buy (MW),Actual Wind (MW)\n'];
    const rows = data.series.map(s => 
      `${s.hour}:00,${s.startTime},${s.demand_mw ?? ''},${s.forecast_mw},${s.net_thermal_mw ?? ''},${s.actual_mw ?? ''}`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayAhead_Procurement_Order_${data.delivery_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-400">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm">Fetching Elexon UK Day-Ahead forecasts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
        <p className="font-semibold">Error Loading Planner Data</p>
        <p className="text-sm mt-1">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const { series, metrics, procurement_summary: summary } = data;

  // Chart data
  const chartData = series.map((s) => ({
    hour: `${s.hour}:00`,
    'Expected Wind Supply': s.forecast_mw,
    'Thermal Power You Buy': applySafetyBuffer ? s.buffered_thermal_mw : s.net_thermal_mw,
    'Customer Demand': s.demand_mw,
    'Actual Wind (Reality)': showActuals ? s.actual_mw : null
  }));

  // Evolution chart data
  const evolutionChartData = series.map((s) => {
    const point: any = { hour: `${s.hour}:00`, 'Decision Forecast (Latest)': s.forecast_mw };
    evolutionRuns.forEach((r) => {
      const p = r.points.find(x => x.startTime === s.startTime);
      const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
      point[label] = p ? p.generation : null;
    });
    if (showActuals) point['Actual Wind (Reality)'] = s.actual_mw;
    return point;
  });

  return (
    <div className="space-y-6">

      {/* Top Banner: Date & Situation Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Day-Ahead Decision Session • January 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
            Day-Ahead Power Purchase Planner
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Planning purchases on <strong className="text-cyan-300 font-semibold">{data.decision_date}</strong> for power delivery on <strong className="text-emerald-400 font-semibold">{data.delivery_date}</strong> (based on the latest forecast before {cutoffTime} GMT Gate Closure).
          </p>
        </div>

        {/* Date Selector Dropdown (Mobile/Tablet Friendly) */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs shrink-0">
          <span className="text-slate-400 font-medium">Select Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            {dates.map((d) => (
              <option key={d.decision_date} value={d.decision_date} className="bg-slate-900 text-slate-200">
                Decision: {d.decision_date} → Delivery: {d.delivery_date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Primary Executive Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Expected Wind Power"
          value={Math.round(summary.total_wind_forecast_mwh).toLocaleString()}
          unit="MWh"
          subtitle={`Supplies ${summary.wind_penetration_pct}% of total customer demand`}
          icon={Wind}
          badge="Renewable Supply"
          badgeColor="cyan"
        />

        <MetricsCard
          title="Thermal Power To Buy"
          value={Math.round(applySafetyBuffer ? summary.total_buffered_procured_mwh : summary.total_thermal_procured_mwh).toLocaleString()}
          unit="MWh"
          subtitle={`Covers residual ${summary.thermal_share_pct}% demand`}
          icon={Flame}
          badge="Action Required"
          badgeColor="amber"
        />

        <MetricsCard
          title="Forecast Trust Score"
          value={`${(100 - metrics.wape).toFixed(1)}%`}
          unit=""
          subtitle={`Average deviation: ±${metrics.mae} MW (${metrics.wape}%)`}
          icon={Award}
          badge="High Reliability"
          badgeColor="emerald"
        />

        <MetricsCard
          title="Safety Buffer"
          value={applySafetyBuffer ? `+${safetyBufferMw} MW` : 'Off'}
          unit={applySafetyBuffer ? '/ hour' : ''}
          subtitle={applySafetyBuffer ? `+${(safetyBufferMw * 24).toLocaleString()} MWh insurance reserve` : 'Recommended: +850 MW buffer'}
          icon={ShieldAlert}
          badge={applySafetyBuffer ? 'Hedged (P90)' : 'Unhedged'}
          badgeColor={applySafetyBuffer ? 'emerald' : 'slate'}
        />
      </div>

      {/* Main Visual Story: What Customer Needs vs What Wind Provides vs What You Buy */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tomorrow's Electricity Balance (24 Hours)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Delivery: {data.delivery_date}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              The <span className="text-cyan-400 font-semibold">Cyan area</span> is free wind generation. The <span className="text-amber-400 font-semibold">Amber area</span> is the exact thermal power you must buy in the day-ahead market.
            </p>
          </div>

          {/* Clean Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setShowActuals(!showActuals)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                showActuals 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showActuals ? 'Hide Reality' : 'Compare with Reality (Actuals)'}</span>
            </button>

            <button
              onClick={() => setShowEvolution(!showEvolution)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                showEvolution 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-medium' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Forecast Evolution Runs</span>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {!showEvolution ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="windUserGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="thermalUserGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" MW" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {/* Customer Demand Line */}
                <Line 
                  type="monotone" 
                  dataKey="Customer Demand" 
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                />

                {/* Expected Wind Supply Area */}
                <Area 
                  type="monotone" 
                  dataKey="Expected Wind Supply" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#windUserGrad)" 
                />

                {/* Thermal Power You Buy Area */}
                <Area 
                  type="monotone" 
                  dataKey="Thermal Power You Buy" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#thermalUserGrad)" 
                />

                {/* Actual Wind (Reality) */}
                {showActuals && (
                  <Line 
                    type="monotone" 
                    dataKey="Actual Wind (Reality)" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="2 2"
                    dot={{ r: 2, fill: '#10b981' }}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={evolutionChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" MW" />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                <Line type="monotone" dataKey="Decision Forecast (Latest)" stroke="#06b6d4" strokeWidth={3} dot={false} />

                {evolutionRuns.map((r, i) => {
                  const colors = ['#9333ea', '#a855f7', '#c084fc', '#e879f9'];
                  const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
                  return (
                    <Line key={r.publishTime} type="monotone" dataKey={label} stroke={colors[i % colors.length]} strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                  );
                })}

                {showActuals && <Line type="monotone" dataKey="Actual Wind (Reality)" stroke="#10b981" strokeWidth={2} dot={false} />}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision Simulator & Trade Order Execution Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Simple Controls */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Interactive Purchase Decision Controls
            </h3>
          </div>

          {/* Customer Demand Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Your Customers' Expected Peak Demand:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{baseDemand.toLocaleString()} MW</span>
            </div>
            <input
              type="range"
              min={15000}
              max={45000}
              step={500}
              value={baseDemand}
              onChange={(e) => setBaseDemand(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-2.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>15,000 MW (Low Load)</span>
              <span>Typical UK Winter Peak: ~32,000 MW</span>
              <span>45,000 MW (Extreme Cold)</span>
            </div>
          </div>

          {/* Safety Cushion Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Recommended Safety Cushion (P90 Downside Buffer)</span>
              </div>
              <p className="text-xs text-slate-400">
                Automatically adds <strong>+{safetyBufferMw} MW</strong> extra thermal power to ensure you don't run short if wind suddenly drops.
              </p>
            </div>

            <button
              onClick={() => setApplySafetyBuffer(!applySafetyBuffer)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                applySafetyBuffer
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {applySafetyBuffer ? '✓ Safety Cushion Active' : '+ Add Safety Cushion'}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Big Friendly Action Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready to Order</span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              Day-Ahead Purchase Order
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Order this total quantity in the wholesale market auction:
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Total Thermal Volume To Buy</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                {Math.round(applySafetyBuffer ? summary.total_buffered_procured_mwh : summary.total_thermal_procured_mwh).toLocaleString()} MWh
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {applySafetyBuffer ? `Includes +${(safetyBufferMw * 24).toLocaleString()} MWh safety reserve` : 'Unhedged baseline order'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Purchase Order (CSV)</span>
            </button>
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Submit to EPEX SPOT / Nord Pool auction before 11:00 GMT.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Clean Hourly Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Hourly Power Breakdown ({data.delivery_date})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hour-by-hour detail of forecasted wind, customer demand, and thermal energy to purchase.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Hour (GMT)</th>
                <th className="py-3 px-4">Customer Demand</th>
                <th className="py-3 px-4 text-cyan-400">Expected Wind</th>
                <th className="py-3 px-4 text-amber-400">Thermal To Buy</th>
                {showActuals && <th className="py-3 px-4 text-emerald-400">Actual Wind (Reality)</th>}
                <th className="py-3 px-4">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {series.map((s) => {
                const thermal = applySafetyBuffer ? s.buffered_thermal_mw : s.net_thermal_mw;
                const windCoverage = s.demand_mw ? Math.round((s.forecast_mw / s.demand_mw) * 100) : 0;
                return (
                  <tr key={s.hour} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-4 font-semibold text-white">{s.hour}:00</td>
                    <td className="py-2.5 px-4 text-slate-300">{s.demand_mw?.toLocaleString()} MW</td>
                    <td className="py-2.5 px-4 text-cyan-300 font-bold">{s.forecast_mw.toLocaleString()} MW</td>
                    <td className="py-2.5 px-4 text-amber-400 font-bold">{thermal?.toLocaleString()} MW</td>
                    {showActuals && (
                      <td className="py-2.5 px-4 text-emerald-400">{s.actual_mw?.toLocaleString() ?? '—'} MW</td>
                    )}
                    <td className="py-2.5 px-4 font-sans text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                        {windCoverage}% Wind
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
