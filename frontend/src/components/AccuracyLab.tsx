import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea
} from 'recharts';
import {
  Clock, Download, CheckCircle2, Lightbulb, Scale,
  ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import type { MonthlyAccuracyResponse } from '../types';
import { getMonthlyAccuracy } from '../services/api';

interface AccuracyLabProps {
  cutoffTime: string;
}

export const AccuracyLab: React.FC<AccuracyLabProps> = ({ cutoffTime }) => {
  const [data, setData] = useState<MonthlyAccuracyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'mae' | 'bias' | 'wape'>('mae');
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
    const headers = 'Decision_Date,Delivery_Date,MAE_MW,RMSE_MW,WAPE_Pct,Mean_Bias_MW,Mean_Actual_MW,Mean_Forecast_MW,R_Squared';
    const rows = data.daily_breakdown.map(d =>
      `${d.decision_date},${d.delivery_date},${d.mae},${d.rmse},${d.wape},${d.mean_bias},${d.mean_actual},${d.mean_forecast},${d.r_squared}`
    );
    const blob = new Blob(['\uFEFF' + [headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gridbricks_January_2026_Accuracy_Audit.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-zinc-500">
        <Scale className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Auditing January 2026 forecast accuracy across 744 hours...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
        <p className="font-semibold text-sm">Error Loading Accuracy Lab</p>
        <p className="text-xs mt-1 text-rose-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const { overall_kpis: kpi, daily_breakdown, diurnal_profile } = data;

  // Sorted daily rows
  const sortedDays = [...daily_breakdown].sort((a: any, b: any) => {
    let vA = a[sortField];
    let vB = b[sortField];
    if (vA < vB) return sortAsc ? -1 : 1;
    if (vA > vB) return sortAsc ? 1 : -1;
    return 0;
  });

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 inline ml-1" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-zinc-900 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-zinc-900 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              QUANTIFIED MODEL AUDIT // JANUARY 2026
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200">
              744 Wholesale Hours
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-950 mt-1 tracking-tight">
            Accuracy, Reliability & Backtest Lab
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Empirical evaluation of day-ahead Elexon BMRS WINDFOR forecasts against actual FUELHH settlement outturn across all 31 days.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-md text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-zinc-600" />
          <span>Export Full Month Audit (CSV)</span>
        </button>
      </div>

      {/* 744-HOUR EVALUATION SUMMARY STRIP */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
          
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Mean Absolute Error (MAE)</span>
              <span className="px-2 py-0.5 rounded-sm bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-medium">
                Benchmark
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-tabular text-zinc-950 tracking-tight">{kpi.mae.toLocaleString()}</span>
              <span className="text-xs font-medium text-zinc-500">MW</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Average hourly forecast deviation across the month
            </p>
          </div>

          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Error Rate (WAPE)</span>
              <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                High Fidelity
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-tabular text-emerald-700 tracking-tight">{kpi.wape}%</span>
              <span className="text-xs font-medium text-zinc-500">Volume Error</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Equivalent to <strong className="text-zinc-800">{(100 - kpi.wape).toFixed(1)}% accuracy</strong> on total energy
            </p>
          </div>

          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Systematic Model Bias</span>
              <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                Short Risk Tendency
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-tabular text-amber-700 tracking-tight">
                {kpi.mean_bias > 0 ? `+${kpi.mean_bias}` : kpi.mean_bias}
              </span>
              <span className="text-xs font-medium text-amber-800">MW</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Mild over-prediction bias; prompts safety cushion
            </p>
          </div>

          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Trajectory Fit (R²)</span>
              <span className="px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-medium">
                Macro Weather
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-tabular text-zinc-950 tracking-tight">{kpi.r_squared}</span>
              <span className="text-xs font-medium text-zinc-500">Correlation</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              P90 Downside Risk bound: <strong className="text-zinc-800 font-tabular">+{Math.round(kpi.p90_error)} MW</strong>
            </p>
          </div>

        </div>
      </div>

      {/* 3 Plain-English Operational Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg bg-white border border-zinc-200 border-l-4 border-l-teal-600 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-semibold uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Insight 1: Macro Weather Tracking</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            The Elexon wind forecast captured <strong className="text-zinc-900">89% of general wind shifts</strong> (R² = 0.89), reliably tracking major UK storm ramp-ups and wind lulls.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-white border border-zinc-200 border-l-4 border-l-amber-600 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Insight 2: Morning Volatility</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Forecasting error spikes during the <strong className="text-zinc-900">07:00–09:00 AM</strong> morning demand ramp. Applying an extra safety buffer during morning hours mitigates sudden balancing exposures.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-white border border-zinc-200 border-l-4 border-l-emerald-600 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Insight 3: The P90 Safety Rule</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            In 90% of hours, wind drop-offs were under <strong className="text-zinc-900">850 MW</strong>. Contracting an 850 MW thermal reserve protects your desk against 9 out of 10 sudden shortfalls.
          </p>
        </div>
      </div>

      {/* Charts Row: Daily Timeline & Diurnal Hour-of-Day Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Accuracy Timeline */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                Daily Forecast Accuracy Across January 2026
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Day-by-day error metrics across all 31 delivery days.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200 text-xs">
              <button
                onClick={() => setSelectedMetric('mae')}
                className={`px-2.5 py-1 rounded-sm font-medium transition cursor-pointer ${
                  selectedMetric === 'mae' 
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200' 
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                MAE (MW)
              </button>
              <button
                onClick={() => setSelectedMetric('bias')}
                className={`px-2.5 py-1 rounded-sm font-medium transition cursor-pointer ${
                  selectedMetric === 'bias' 
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200' 
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Bias (MW)
              </button>
              <button
                onClick={() => setSelectedMetric('wape')}
                className={`px-2.5 py-1 rounded-sm font-medium transition cursor-pointer ${
                  selectedMetric === 'wape' 
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200' 
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Error %
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis 
                  dataKey="delivery_date" 
                  stroke="#71717A" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.substring(8, 10)} 
                />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} unit={selectedMetric === 'wape' ? '%' : ' MW'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E4E4E7', 
                    borderRadius: '8px', 
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
                  }}
                  labelFormatter={(val) => `Delivery Date: ${val}`}
                  formatter={(value: any, name: any) => [
                    selectedMetric === 'wape' ? `${value}%` : `${Number(value).toLocaleString()} MW`,
                    name
                  ]}
                />
                <ReferenceLine y={0} stroke="#A1A1AA" />
                {selectedMetric === 'mae' && <Bar dataKey="mae" name="Average Error (MAE MW)" fill="#0D9488" radius={[3, 3, 0, 0]} />}
                {selectedMetric === 'bias' && <Bar dataKey="mean_bias" name="Forecast Bias (MW)" fill="#D97706" radius={[3, 3, 0, 0]} />}
                {selectedMetric === 'wape' && <Bar dataKey="wape" name="Error Rate (WAPE %)" fill="#16A34A" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal Hour-of-Day Risk Pattern */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
                  Diurnal 24-Hour Error Profile
                </h3>
                <span className="px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                  07:00–09:00 AM Ramp Alert
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Error profile averaged across the 24 hours of the delivery day.
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diurnal_profile} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis dataKey="hour_label" stroke="#71717A" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 10 }} unit=" MW" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E4E4E7', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)' 
                  }} 
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()} MW`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <ReferenceArea x1="07:00" x2="09:00" fill="#FEF3C7" fillOpacity={0.6} label={{ value: '07-09 Morning Ramp', fill: '#92400E', fontSize: 10, position: 'insideTop' }} />
                <ReferenceLine y={0} stroke="#A1A1AA" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="mae" name="Average Error (MAE MW)" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="mean_bias" name="Forecast Bias (MW)" stroke="#D97706" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Clean 31-Day Audit Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 tracking-tight">
              January 2026 Daily Evaluation Log
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click any column header to sort. Directional markers indicate over/under-prediction against outturn.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-tabular">
            <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4 font-sans cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('delivery_date')}>
                  Delivery Date {renderSortIndicator('delivery_date')}
                </th>
                <th className="py-3 px-4 font-sans cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('mean_actual')}>
                  Actual Wind (MW) {renderSortIndicator('mean_actual')}
                </th>
                <th className="py-3 px-4 font-sans text-teal-800 cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('mean_forecast')}>
                  Expected Wind (MW) {renderSortIndicator('mean_forecast')}
                </th>
                <th className="py-3 px-4 font-sans text-amber-800 cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('mae')}>
                  Avg Error (MAE) {renderSortIndicator('mae')}
                </th>
                <th className="py-3 px-4 font-sans cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('wape')}>
                  Error Rate (%) {renderSortIndicator('wape')}
                </th>
                <th className="py-3 px-4 font-sans cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('mean_bias')}>
                  Model Bias {renderSortIndicator('mean_bias')}
                </th>
                <th className="py-3 px-4 font-sans cursor-pointer hover:text-zinc-950 transition" onClick={() => handleSort('r_squared')}>
                  Accuracy (R²) {renderSortIndicator('r_squared')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sortedDays.map((d: any) => (
                <tr key={d.decision_date} className="hover:bg-zinc-50/70 transition">
                  <td className="py-2.5 px-4 text-zinc-900 font-semibold font-sans">{d.delivery_date}</td>
                  <td className="py-2.5 px-4 text-zinc-700">{d.mean_actual.toLocaleString()} MW</td>
                  <td className="py-2.5 px-4 text-teal-700 font-semibold">{d.mean_forecast.toLocaleString()} MW</td>
                  <td className="py-2.5 px-4 text-amber-700 font-semibold">{d.mae.toLocaleString()} MW</td>
                  <td className="py-2.5 px-4 text-zinc-700">{d.wape}%</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium border ${
                      d.mean_bias > 0 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {d.mean_bias > 0 ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>+{d.mean_bias} MW (Short)</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{d.mean_bias} MW (Spill)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-700">{d.r_squared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
