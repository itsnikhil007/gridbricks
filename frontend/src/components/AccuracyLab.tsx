import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
  BarChart3, TrendingUp, AlertTriangle, Scale, Target, 
  Calendar, Clock, ShieldCheck, Download
} from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import type { MonthlyAccuracyResponse } from '../types';
import { getMonthlyAccuracy } from '../services/api';

interface AccuracyLabProps {
  cutoffTime: string;
}

export const AccuracyLab: React.FC<AccuracyLabProps> = ({ cutoffTime }) => {
  const [data, setData] = useState<MonthlyAccuracyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'mae' | 'rmse' | 'wape' | 'bias'>('mae');
  const [sortField, setSortField] = useState<string>('delivery_date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getMonthlyAccuracy(cutoffTime);
        if (isMounted) setData(resp);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load accuracy analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, [cutoffTime]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Decision Date,Delivery Date,MAE (MW),RMSE (MW),WAPE (%),Mean Bias (MW),Mean Actual (MW),Mean Forecast (MW),R-Squared\n'];
    const rows = data.daily_breakdown.map(d =>
      `${d.decision_date},${d.delivery_date},${d.mae},${d.rmse},${d.wape},${d.mean_bias},${d.mean_actual},${d.mean_forecast},${d.r_squared}`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elexon_January_2026_Accuracy_Report_${cutoffTime.replace(':', '')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Scale className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm">Evaluating January 2026 quantitative accuracy across 744 hours...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
        <p className="font-semibold">Error Loading Accuracy Analytics</p>
        <p className="text-sm mt-1">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const { overall_kpis: kpi, daily_breakdown, diurnal_profile, residuals_histogram } = data;

  // Sorted daily rows
  const sortedDays = [...daily_breakdown].sort((a: any, b: any) => {
    let vA = a[sortField];
    let vB = b[sortField];
    if (vA < vB) return sortAsc ? -1 : 1;
    if (vA > vB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Title & Scope Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Statistical Verification & Risk Lab</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
            January 2026 Quantitative Forecast Accuracy
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Auditing 744 wholesale settlement hours against Elexon BMRS WINDFOR forecasts evaluated at <strong className="text-cyan-300">{cutoffTime} GMT Gate Closure</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Full Month Accuracy (CSV)</span>
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricsCard
          title="Mean Absolute Error (MAE)"
          value={kpi.mae.toLocaleString()}
          unit="MW"
          subtitle={`Avg volume discrepancy / hr`}
          icon={TrendingUp}
          trend={kpi.mae < 1000 ? 'positive' : 'warning'}
          trendText={`${Math.round((kpi.mae / kpi.mean_actual) * 100)}% of avg gen`}
        />

        <MetricsCard
          title="Root Mean Sq Error (RMSE)"
          value={kpi.rmse.toLocaleString()}
          unit="MW"
          subtitle="Penalizes extreme deviations"
          icon={AlertTriangle}
          trend={kpi.rmse < 1500 ? 'positive' : 'negative'}
          trendText={`Variance: ${(kpi.rmse - kpi.mae).toFixed(0)} MW gap`}
        />

        <MetricsCard
          title="Weighted WAPE"
          value={kpi.wape}
          unit="%"
          subtitle="Total |Error| ÷ Total Generation"
          icon={Scale}
          trend={kpi.wape < 12 ? 'positive' : 'warning'}
          trendText="Wholesale benchmark"
        />

        <MetricsCard
          title="Mean Forecast Bias"
          value={`${kpi.mean_bias > 0 ? '+' : ''}${kpi.mean_bias}`}
          unit="MW"
          subtitle={kpi.mean_bias > 0 ? "Systematic Over-forecast" : "Systematic Under-forecast"}
          icon={Target}
          trend={Math.abs(kpi.mean_bias) < 300 ? 'positive' : 'warning'}
          trendText={kpi.mean_bias > 0 ? 'Short Risk' : 'Long Spill'}
        />

        <MetricsCard
          title="Correlation (R²)"
          value={kpi.r_squared}
          unit=""
          subtitle="Generation tracking fidelity"
          icon={ShieldCheck}
          trend={kpi.r_squared > 0.85 ? 'positive' : 'warning'}
          trendText="High predictive power"
        />
      </div>

      {/* Charts Row 1: Daily Trend & Diurnal Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Accuracy Trend Across January */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Daily Forecast Error Timeline (Jan 2026)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                MAE and Mean Bias for each delivery day of January 2026.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setSelectedMetric('mae')}
                className={`px-2 py-0.5 rounded ${selectedMetric === 'mae' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
              >
                MAE
              </button>
              <button
                onClick={() => setSelectedMetric('bias')}
                className={`px-2 py-0.5 rounded ${selectedMetric === 'bias' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
              >
                Bias
              </button>
              <button
                onClick={() => setSelectedMetric('wape')}
                className={`px-2 py-0.5 rounded ${selectedMetric === 'wape' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
              >
                WAPE%
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="delivery_date" 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.substring(8, 10)} 
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '11px' 
                  }}
                  labelFormatter={(val) => `Delivery Date: ${val}`}
                />
                <ReferenceLine y={0} stroke="#475569" />
                {selectedMetric === 'mae' && (
                  <Bar dataKey="mae" name="MAE (MW)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                )}
                {selectedMetric === 'bias' && (
                  <Bar 
                    dataKey="mean_bias" 
                    name="Mean Bias (MW)" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {selectedMetric === 'wape' && (
                  <Bar dataKey="wape" name="WAPE (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal (Hour of Day) Risk Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Diurnal Risk Breakdown (Hour of Day)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Average forecast error across 24 hours of the day (identifying peak risk hours).
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              24-Hour Profile
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diurnal_profile} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" MW" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '11px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line 
                  type="monotone" 
                  dataKey="mae" 
                  name="Hourly MAE (MW)" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mean_bias" 
                  name="Hourly Bias (MW)" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Residuals Distribution & Quantile Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Residual Histogram */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Forecast Residual Distribution (Error = Forecast − Actual)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Histogram of volumetric errors across all 744 hours, showing probability distribution of misses.
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residuals_histogram} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range_label" stroke="#64748b" tick={{ fontSize: 9 }} interval={2} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: '#1e293b', 
                    borderRadius: '0.75rem', 
                    fontSize: '11px' 
                  }} 
                />
                <Bar dataKey="count" name="Hours Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantiles & Value-at-Risk Insight */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Tail Risk Quantiles</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Value-at-Risk (VaR) Bounds
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Quantifying the 10th and 90th percentile errors for hedging:
            </p>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">P10 Tail (Severe Underestimation)</span>
                  <span className="text-sm text-slate-200">Wind under-delivers</span>
                </div>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {kpi.p10_error} MW
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">P50 (Median Error)</span>
                  <span className="text-sm text-slate-200">Central tendency</span>
                </div>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {kpi.p50_error} MW
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">P90 Tail (Severe Overestimation)</span>
                  <span className="text-sm text-slate-200">Short position risk</span>
                </div>
                <span className="text-base font-bold font-mono text-rose-400">
                  +{kpi.p90_error} MW
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <strong>Trading Recommendation:</strong> Contracting an additional <strong>+{Math.round(kpi.p90_error)} MW</strong> thermal buffer protects the portfolio against 90% of sudden wind drop-off risks.
          </div>
        </div>
      </div>

      {/* Daily Performance Audit Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              January 2026 Daily Evaluation Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any column header to sort. Complete audit trail of day-ahead decision accuracy.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('delivery_date'); setSortAsc(!sortAsc); }}>
                  Delivery Date
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('mean_actual'); setSortAsc(!sortAsc); }}>
                  Actual Gen (MW)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('mean_forecast'); setSortAsc(!sortAsc); }}>
                  Forecast Gen (MW)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('mae'); setSortAsc(!sortAsc); }}>
                  MAE (MW)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('rmse'); setSortAsc(!sortAsc); }}>
                  RMSE (MW)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('wape'); setSortAsc(!sortAsc); }}>
                  WAPE (%)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('mean_bias'); setSortAsc(!sortAsc); }}>
                  Mean Bias (MW)
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('r_squared'); setSortAsc(!sortAsc); }}>
                  R²
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedDays.map((d: any) => (
                <tr key={d.decision_date} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-white font-medium">{d.delivery_date}</td>
                  <td className="py-2.5 px-3 text-slate-300">{d.mean_actual.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{d.mean_forecast.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-semibold">{d.mae.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-300">{d.rmse.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-300">{d.wape}%</td>
                  <td className={`py-2.5 px-3 font-semibold ${d.mean_bias > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {d.mean_bias > 0 ? `+${d.mean_bias}` : d.mean_bias}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{d.r_squared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
