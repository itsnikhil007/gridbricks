import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Calendar, Flame, Wind, ShieldAlert, TrendingUp, Sliders,
  Download, Eye, CheckCircle, Info, Activity
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

  // Simulation controls
  const [baseDemand, setBaseDemand] = useState<number>(32000);
  const [profileType, setProfileType] = useState<string>('winter_peak');
  const [safetyBuffer, setSafetyBuffer] = useState<number>(0);
  const [showActuals, setShowActuals] = useState<boolean>(true);
  const [showEvolution, setShowEvolution] = useState<boolean>(false);

  // Load latest forecast when date, cutoff, demand, or buffer changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getLatestForecast({
          decision_date: selectedDate,
          cutoff_time: cutoffTime,
          base_demand_mw: baseDemand,
          profile_type: profileType,
          p90_buffer_mw: safetyBuffer
        });
        if (isMounted) {
          setData(resp);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load forecast data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedDate, cutoffTime, baseDemand, profileType, safetyBuffer]);

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
    const headers = ['Hour,Start Time,Wind Forecast (MW),Customer Demand (MW),Net Thermal To Buy (MW),Actual Wind (MW),Error (MW)\n'];
    const rows = data.series.map(s => 
      `${s.hour}:00,${s.startTime},${s.forecast_mw},${s.demand_mw ?? ''},${s.net_thermal_mw ?? ''},${s.actual_mw ?? ''},${s.error_mw ?? ''}`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayAhead_Procurement_${data.delivery_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm">Fetching latest UK Day-Ahead Elexon forecast...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
        <p className="font-semibold">Error Loading Decision Desk Data</p>
        <p className="text-sm mt-1">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const { series, metrics, procurement_summary: summary } = data;

  // Chart data formatting
  const chartData = series.map((s) => ({
    hour: `${s.hour}:00`,
    'Wind Forecast': s.forecast_mw,
    'Actual Wind': showActuals ? s.actual_mw : null,
    'Total Demand': s.demand_mw,
    'Net Thermal Procured': s.net_thermal_mw,
    'Buffered Procurement': s.buffered_thermal_mw
  }));

  // Evolution chart data combining runs
  const evolutionChartData = series.map((s) => {
    const point: any = { hour: `${s.hour}:00`, 'Decision Forecast (Latest)': s.forecast_mw };
    evolutionRuns.forEach((r) => {
      const p = r.points.find(x => x.startTime === s.startTime);
      const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
      point[label] = p ? p.generation : null;
    });
    if (showActuals) point['Actual Wind'] = s.actual_mw;
    return point;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Decision Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Day-Ahead Decision Session • January 2026</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
              Day-Ahead Power Procurement Desk
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Decision made on <span className="text-cyan-300 font-semibold">{data.decision_date}</span> at <span className="text-cyan-300 font-semibold">{cutoffTime} GMT Gate Closure</span> for power delivery on <span className="text-emerald-400 font-semibold">{data.delivery_date}</span>.
            </p>
          </div>

          {/* Date Picker Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm">
              <span className="text-slate-400 text-xs font-medium">Select Decision Date:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
              >
                {dates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date} className="bg-slate-900 text-slate-200">
                    {d.decision_date} (Delivery: {d.delivery_date})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Live Active Forecast Info Pill */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Latest Available Run:</span>
            <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
              {data.latest_publish_run || 'WINDFOR Stream Run'}
            </code>
            <span className="text-slate-500">• Complete 24h wholesale coverage verified</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Wholesale Market Delivery: <strong className="text-slate-200">00:00 to 23:00 GMT</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Forecasted Wind Energy"
          value={Math.round(summary.total_wind_forecast_mwh).toLocaleString()}
          unit="MWh"
          subtitle={`Penetration: ${summary.wind_penetration_pct}% of demand`}
          icon={Wind}
          trend="positive"
          trendText="Renewable Supply"
        />

        <MetricsCard
          title="Thermal Power To Procure"
          value={Math.round(summary.total_thermal_procured_mwh).toLocaleString()}
          unit="MWh"
          subtitle={`Covers ${summary.thermal_share_pct}% residual demand`}
          icon={Flame}
          trend="warning"
          trendText="Auction Volume"
        />

        <MetricsCard
          title="Forecast Error (MAE)"
          value={metrics.mae.toLocaleString()}
          unit="MW"
          subtitle={`WAPE: ${metrics.wape}% of actual generation`}
          icon={TrendingUp}
          trend={metrics.wape < 10 ? 'positive' : 'warning'}
          trendText={`Bias: ${metrics.mean_bias > 0 ? '+' : ''}${metrics.mean_bias} MW`}
        />

        <MetricsCard
          title="Risk Safety Buffer"
          value={safetyBuffer > 0 ? `+${safetyBuffer * 24}` : '0'}
          unit="MWh"
          subtitle={safetyBuffer > 0 ? `Hedged with ${safetyBuffer} MW margin` : 'Unhedged baseline procurement'}
          icon={ShieldAlert}
          trend={safetyBuffer > 0 ? 'positive' : 'neutral'}
          trendText={safetyBuffer > 0 ? 'P90 Protected' : 'No Buffer'}
        />
      </div>

      {/* Main Chart Section: Generation Profile & Net Thermal Gap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Day-Ahead Power Dispatch Profile</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Delivery: {data.delivery_date}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualizing customer demand, forecasted wind generation, and the resulting thermal procurement requirement.
            </p>
          </div>

          {/* Chart Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setShowActuals(!showActuals)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                showActuals 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Overlay Actuals</span>
            </button>

            <button
              onClick={() => setShowEvolution(!showEvolution)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                showEvolution 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-medium' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Forecast Evolution Runs</span>
            </button>
          </div>
        </div>

        {/* Primary Chart */}
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {!showEvolution ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="thermalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }} 
                  unit=" MW" 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {/* Total Customer Demand Line */}
                <Line 
                  type="monotone" 
                  dataKey="Total Demand" 
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                />

                {/* Forecasted Wind Area */}
                <Area 
                  type="monotone" 
                  dataKey="Wind Forecast" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#windGradient)" 
                />

                {/* Net Thermal Procurement Required Area */}
                <Area 
                  type="monotone" 
                  dataKey="Net Thermal Procured" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#thermalGradient)" 
                />

                {/* Optional Buffered Procurement Line */}
                {safetyBuffer > 0 && (
                  <Line 
                    type="monotone" 
                    dataKey="Buffered Procurement" 
                    stroke="#fb7185" 
                    strokeWidth={2} 
                    dot={false}
                  />
                )}

                {/* Optional Actual Wind Line */}
                {showActuals && (
                  <Line 
                    type="monotone" 
                    dataKey="Actual Wind" 
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                <Line 
                  type="monotone" 
                  dataKey="Decision Forecast (Latest)" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  dot={false} 
                />

                {evolutionRuns.map((r, i) => {
                  const colors = ['#9333ea', '#a855f7', '#c084fc', '#e879f9'];
                  const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
                  return (
                    <Line
                      key={r.publishTime}
                      type="monotone"
                      dataKey={label}
                      stroke={colors[i % colors.length]}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  );
                })}

                {showActuals && (
                  <Line 
                    type="monotone" 
                    dataKey="Actual Wind" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Thermal Procurement Simulator & Risk Buffer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Procurement Controls */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Day-Ahead Thermal Procurement Simulator
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Demand Control */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Utility Customer Peak Demand</span>
                <span className="text-cyan-400 font-mono font-bold">{baseDemand.toLocaleString()} MW</span>
              </div>
              <input
                type="range"
                min={15000}
                max={45000}
                step={500}
                value={baseDemand}
                onChange={(e) => setBaseDemand(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>15,000 MW</span>
                <span>Typical UK Load: ~32,000 MW</span>
                <span>45,000 MW</span>
              </div>
            </div>

            {/* Demand Profile Selector */}
            <div className="space-y-2">
              <span className="text-slate-400 text-xs font-medium block">Demand Curve Profile</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setProfileType('winter_peak')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    profileType === 'winter_peak'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Winter Peak (National Grid ESO)
                </button>
                <button
                  onClick={() => setProfileType('flat')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    profileType === 'flat'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flat 24h Baseload
                </button>
              </div>
            </div>

            {/* Risk Safety Buffer Slider */}
            <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-slate-300 font-medium">Risk-Adjusted Safety Buffer (Hedging Margin)</span>
                </div>
                <span className="text-rose-400 font-mono font-bold">+{safetyBuffer} MW / hour</span>
              </div>
              <input
                type="range"
                min={0}
                max={2500}
                step={50}
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>0 MW (Unhedged, P50 baseline)</span>
                <button
                  onClick={() => setSafetyBuffer(metrics.p90_error > 0 ? Math.round(metrics.p90_error) : 800)}
                  className="text-cyan-400 hover:underline text-[11px] font-medium"
                >
                  1-Click: Auto-Apply P90 Downside Risk Margin ({Math.round(metrics.p90_error)} MW)
                </button>
                <span>2,500 MW (High Safety)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Trading Desk Action Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Recommended Auction Order</span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              Day-Ahead Procurement Order
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Submit these quantities to EPEX SPOT / Nord Pool wholesale auction:
            </p>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Baseline Thermal Volume</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {Math.round(summary.total_thermal_procured_mwh).toLocaleString()} MWh
                </span>
              </div>

              {safetyBuffer > 0 && (
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  <span className="text-[11px] text-rose-300 block">With Risk Safety Margin</span>
                  <span className="text-xl font-bold font-mono text-rose-400">
                    {Math.round(summary.total_buffered_procured_mwh).toLocaleString()} MWh
                  </span>
                  <span className="text-[10px] text-rose-300/80 block mt-0.5">
                    Includes +{Math.round(summary.buffer_reserve_mwh).toLocaleString()} MWh imbalance reserve
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              Decision locked based on forecast published before <strong>{cutoffTime} GMT</strong>. Residual error will settle at balancing Cash-out prices.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
