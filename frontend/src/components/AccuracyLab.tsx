import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea
} from 'recharts';
import {
  BarChart3, TrendingUp, AlertTriangle, Scale, Target, 
  Calendar, Clock, ShieldCheck, Download, Activity,
  ArrowUpDown, ArrowUp, ArrowDown
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

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-2.5 h-2.5 text-[#00D2FF]" />
    ) : (
      <ArrowDown className="w-2.5 h-2.5 text-[#00D2FF]" />
    );
  };

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
    const headers = 'Decision_Date,Delivery_Date,MAE_MW,RMSE_MW,WAPE_Pct,Mean_Bias_MW,Mean_Actual_MW,Mean_Forecast_MW,R_Squared\n';
    const rows = data.daily_breakdown.map(d =>
      `${d.decision_date},${d.delivery_date},${d.mae},${d.rmse},${d.wape},${d.mean_bias},${d.mean_actual},${d.mean_forecast},${d.r_squared}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ELEXON_JAN_2026_ACCURACY_AUDIT_${cutoffTime.replace(':', '')}GMT.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400 font-mono">
        <Activity className="w-8 h-8 text-[#00D2FF] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider">Evaluating 744 Wholesale Settlement Hours...</p>
        <span className="text-[10px] text-slate-500 mt-1">Elexon BMRS WINDFOR Multi-Run Statistical Engine</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-[#0E131F] border border-[#EF4444] rounded-xs font-mono text-xs text-[#EF4444]">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>ACCURACY LAB DATA ERROR</span>
        </div>
        <p className="text-slate-400">{error || 'Unknown statistical analysis error'}</p>
      </div>
    );
  }

  const { overall_kpis: kpi, daily_breakdown, diurnal_profile, residuals_histogram } = data;

  // Sort daily rows
  const sortedDays = [...daily_breakdown].sort((a: any, b: any) => {
    const vA = a[sortField];
    const vB = b[sortField];
    if (vA < vB) return sortAsc ? -1 : 1;
    if (vA > vB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-3 font-sans pb-8">
      {/* 1. Command Banner */}
      <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30 font-semibold uppercase">
                MODEL RISK & ACCURACY LAB
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                JANUARY 2026 // 744 WHOLESALE SETTLEMENT HOURS
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-mono text-white font-bold">
                EVALUATION GATE CLOSURE: <span className="text-[#00D2FF]">{cutoffTime} GMT</span>
              </span>
              <span className="text-slate-500 font-mono">•</span>
              <span className="text-xs font-mono text-slate-300">
                Tracking Fidelity: <span className="text-[#10B981] font-bold">R² = {kpi.r_squared}</span>
              </span>
              <span className="text-slate-500 font-mono hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Evaluated Hours: <strong className="text-white">744 / 744 (100% Complete)</strong>
              </span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2234] hover:bg-[#25324d] text-slate-200 border border-[#2a3754] rounded-xs text-xs font-mono font-semibold transition self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>EXPORT 31-DAY AUDIT (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. 744-Hour Evaluation Command Strip (5 Dense Rectangular KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <MetricsCard
          title="Mean Absolute Error (MAE)"
          value={kpi.mae.toLocaleString()}
          unit="MW"
          subtitle={`Avg error / settlement hr`}
          icon={TrendingUp}
          trend={kpi.mae < 1000 ? 'positive' : 'warning'}
          trendText={`${Math.round((kpi.mae / kpi.mean_actual) * 100)}% of mean`}
        />

        <MetricsCard
          title="Root Mean Sq Error (RMSE)"
          value={kpi.rmse.toLocaleString()}
          unit="MW"
          subtitle="Penalizes extreme tail jumps"
          icon={AlertTriangle}
          trend={kpi.rmse < 1500 ? 'positive' : 'negative'}
          trendText={`Spread: +${(kpi.rmse - kpi.mae).toFixed(0)}MW`}
        />

        <MetricsCard
          title="Weighted WAPE Benchmark"
          value={kpi.wape}
          unit="%"
          subtitle="Total |Error| ÷ Total Gen"
          icon={Scale}
          trend={kpi.wape < 12 ? 'positive' : 'warning'}
          trendText="Wholesale Std"
        />

        <MetricsCard
          title="Systemic Forecast Bias"
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
          subtitle="Generation tracking power"
          icon={ShieldCheck}
          trend={kpi.r_squared > 0.85 ? 'positive' : 'warning'}
          trendText="Macro Fidelity"
        />
      </div>

      {/* 3. Charts Row 1: Daily Timeline & Diurnal Morning Ramp Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Daily Accuracy Timeline with Metric Selector */}
        <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white uppercase">
                <Calendar className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Daily Forecast Error Timeline (Jan 2026)</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                Evaluated for 31 delivery days of January 2026.
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#0A0E17] p-0.5 rounded-xs border border-[#1A2234] font-mono text-[10px]">
              <button
                onClick={() => setSelectedMetric('mae')}
                className={`px-2 py-0.5 rounded-xs transition ${
                  selectedMetric === 'mae' ? 'bg-[#00D2FF]/20 text-[#00D2FF] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                MAE
              </button>
              <button
                onClick={() => setSelectedMetric('rmse')}
                className={`px-2 py-0.5 rounded-xs transition ${
                  selectedMetric === 'rmse' ? 'bg-[#00D2FF]/20 text-[#00D2FF] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                RMSE
              </button>
              <button
                onClick={() => setSelectedMetric('bias')}
                className={`px-2 py-0.5 rounded-xs transition ${
                  selectedMetric === 'bias' ? 'bg-[#FF9F1C]/20 text-[#FF9F1C] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                BIAS
              </button>
              <button
                onClick={() => setSelectedMetric('wape')}
                className={`px-2 py-0.5 rounded-xs transition ${
                  selectedMetric === 'wape' ? 'bg-[#10B981]/20 text-[#10B981] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                WAPE%
              </button>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_breakdown} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121824" vertical={false} />
                <XAxis 
                  dataKey="delivery_date" 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(val) => val.substring(8, 10)} 
                />
                <YAxis 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0E17', 
                    borderColor: '#1A2234', 
                    borderRadius: '2px', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono'
                  }}
                  labelFormatter={(val) => `Delivery: ${val}`}
                />
                <ReferenceLine y={0} stroke="#334155" />
                {selectedMetric === 'mae' && (
                  <Bar dataKey="mae" name="MAE (MW)" fill="#00D2FF" radius={[1, 1, 0, 0]} />
                )}
                {selectedMetric === 'rmse' && (
                  <Bar dataKey="rmse" name="RMSE (MW)" fill="#EF4444" radius={[1, 1, 0, 0]} />
                )}
                {selectedMetric === 'bias' && (
                  <Bar dataKey="mean_bias" name="Mean Bias (MW)" fill="#FF9F1C" radius={[1, 1, 0, 0]} />
                )}
                {selectedMetric === 'wape' && (
                  <Bar dataKey="wape" name="WAPE (%)" fill="#10B981" radius={[1, 1, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal 24-Hour Error Breakdown with Morning Ramp Spike Highlight */}
        <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white uppercase">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Diurnal 24h Error Curve (Morning Ramp Spike Highlight)</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                Volumetric error profile across 24 hours of the day.
              </p>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30">
              07:00–09:00 RAMP ALERT
            </span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diurnal_profile} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121824" vertical={false} />
                <XAxis 
                  dataKey="hour_label" 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                  interval={2}
                />
                <YAxis 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                  unit=" MW" 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0E17', 
                    borderColor: '#1A2234', 
                    borderRadius: '2px', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }} />
                
                <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />

                {/* Morning Ramp Highlight Band: 07:00 to 09:00 GMT */}
                <ReferenceArea 
                  x1="07:00" 
                  x2="09:00" 
                  fill="#FF9F1C" 
                  fillOpacity={0.12} 
                  stroke="#FF9F1C"
                  strokeOpacity={0.4}
                />

                <Line 
                  type="monotone" 
                  dataKey="mae" 
                  name="Hourly MAE (MW)" 
                  stroke="#00D2FF" 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mean_bias" 
                  name="Hourly Bias (MW)" 
                  stroke="#FF9F1C" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3"
                  dot={{ r: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Charts Row 2: Residual Histogram & Tail Risk VaR Bounds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Residual Error Distribution Histogram */}
        <div className="lg:col-span-8 bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white uppercase">
                <BarChart3 className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Forecast Residual Distribution (Error = Forecast − Actual)</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                Empirical probability distribution across all 744 hours with P10/P50/P90 quantile flags.
              </p>
            </div>

            {/* Quantile Flags Badge Strip */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded-xs bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                P10: {kpi.p10_error} MW
              </span>
              <span className="px-1.5 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                P50: {kpi.p50_error} MW
              </span>
              <span className="px-1.5 py-0.5 rounded-xs bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-semibold">
                P90: +{kpi.p90_error} MW
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residuals_histogram} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121824" vertical={false} />
                <XAxis 
                  dataKey="range_label" 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                  interval={2} 
                />
                <YAxis 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0E17', 
                    borderColor: '#1A2234', 
                    borderRadius: '2px', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono'
                  }} 
                />
                <Bar dataKey="count" name="Hours Frequency" fill="#00D2FF" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantile VaR Tail Risk Card */}
        <div className="lg:col-span-4 bg-[#0E131F] border border-[#1A2234] rounded-xs p-3.5 flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A2234] pb-2 mb-3">
              <span className="font-bold text-white uppercase tracking-tight text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
                <span>Value-at-Risk Quantiles</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#8B5CF6]/15 text-[#C4B5FD]">
                P10 / P50 / P90
              </span>
            </div>

            <div className="space-y-2">
              <div className="bg-[#0A0E17] border border-[#1A2234] p-2 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">P10 Tail (Severe Underestimation)</span>
                  <span className="text-[11px] text-slate-300">Wind over-delivers</span>
                </div>
                <span className="text-sm font-bold text-[#00D2FF] tabular-nums">
                  {kpi.p10_error} MW
                </span>
              </div>

              <div className="bg-[#0A0E17] border border-[#1A2234] p-2 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">P50 (Median Error)</span>
                  <span className="text-[11px] text-slate-300">Central Tendency</span>
                </div>
                <span className="text-sm font-bold text-[#10B981] tabular-nums">
                  {kpi.p50_error} MW
                </span>
              </div>

              <div className="bg-[#0A0E17] border border-[#1A2234] p-2 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">P90 Tail (Severe Overestimation)</span>
                  <span className="text-[11px] text-slate-300">Short Position Risk</span>
                </div>
                <span className="text-sm font-bold text-[#EF4444] tabular-nums">
                  +{kpi.p90_error} MW
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#121824] text-[10px] text-slate-400 leading-tight">
            <span className="text-slate-300 font-bold">DESK STRATEGY:</span> Contracting an extra <strong>+{Math.round(kpi.p90_error)} MW</strong> thermal safety buffer covers 90% of severe downside wind misses.
          </div>
        </div>
      </div>

      {/* 5. 31-Day Sortable Daily Performance Table with CSV Export */}
      <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-mono text-xs font-bold text-white uppercase tracking-tight">
              January 2026 Daily Evaluation Log (31 Delivery Days)
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Click any column header to sort. Full forensic audit trail against Elexon BMRS actuals.
            </p>
          </div>
        </div>

        <div className="border border-[#1A2234] rounded-xs overflow-hidden max-h-[340px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0A0E17] text-slate-400 border-b border-[#1A2234] text-[10px] uppercase tracking-wider">
              <tr>
                <th className={`py-2 px-3 cursor-pointer transition ${sortField === 'delivery_date' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('delivery_date')}>
                  <div className="flex items-center gap-1">
                    <span>Delivery Date</span>
                    {renderSortIndicator('delivery_date')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'mean_actual' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('mean_actual')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Act Gen (MW)</span>
                    {renderSortIndicator('mean_actual')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'mean_forecast' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('mean_forecast')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Fcst Gen (MW)</span>
                    {renderSortIndicator('mean_forecast')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'mae' ? 'text-[#FF9F1C] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('mae')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>MAE (MW)</span>
                    {renderSortIndicator('mae')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'rmse' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('rmse')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>RMSE (MW)</span>
                    {renderSortIndicator('rmse')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'wape' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('wape')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>WAPE (%)</span>
                    {renderSortIndicator('wape')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'mean_bias' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('mean_bias')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Bias (MW)</span>
                    {renderSortIndicator('mean_bias')}
                  </div>
                </th>
                <th className={`py-2 px-3 text-right cursor-pointer transition ${sortField === 'r_squared' ? 'text-[#00D2FF] font-bold' : 'hover:text-white'}`} onClick={() => handleSort('r_squared')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>R²</span>
                    {renderSortIndicator('r_squared')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121824] bg-[#080B10]">
              {sortedDays.map((d: any) => (
                <tr key={d.decision_date} className="h-6 hover:bg-[#151C2C] transition-colors tabular-nums">
                  <td className="py-1 px-3 text-white font-semibold">{d.delivery_date}</td>
                  <td className="py-1 px-3 text-right text-slate-300">{d.mean_actual.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right text-[#00D2FF]">{d.mean_forecast.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right text-[#FF9F1C] font-semibold">{d.mae.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right text-slate-300">{d.rmse.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right text-slate-300">{d.wape}%</td>
                  <td className={`py-1 px-3 text-right font-semibold ${d.mean_bias > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {d.mean_bias > 0 ? `+${d.mean_bias}` : d.mean_bias}
                  </td>
                  <td className="py-1 px-3 text-right text-slate-400">{d.r_squared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
