import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Flame, Wind, ShieldAlert, TrendingUp, Sliders,
  Download, Eye, Activity, FileSpreadsheet,
  AlertTriangle, PoundSterling
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
  setCutoffTime?: (time: string) => void;
}

// UK European Format Axis (EFA) 6 block definitions
const EFA_BLOCKS = [
  { id: 1, name: 'EFA 1: Night Base', hours: '23:00 - 03:00', spRange: 'SP 01-06 & 47-48', color: '#64748B' },
  { id: 2, name: 'EFA 2: Night Ramp', hours: '03:00 - 07:00', spRange: 'SP 07-14', color: '#0EA5E9' },
  { id: 3, name: 'EFA 3: Morning Peak', hours: '07:00 - 11:00', spRange: 'SP 15-22', color: '#F59E0B' },
  { id: 4, name: 'EFA 4: Day Light', hours: '11:00 - 15:00', spRange: 'SP 23-30', color: '#10B981' },
  { id: 5, name: 'EFA 5: Evening Peak', hours: '15:00 - 19:00', spRange: 'SP 31-38', color: '#EF4444' },
  { id: 6, name: 'EFA 6: Evening Off-Peak', hours: '19:00 - 23:00', spRange: 'SP 39-46', color: '#8B5CF6' }
];

export const DecisionDesk: React.FC<DecisionDeskProps> = ({
  dates,
  selectedDate,
  setSelectedDate,
  cutoffTime,
  setCutoffTime
}) => {
  const [data, setData] = useState<DayAheadForecastResponse | null>(null);
  const [evolutionRuns, setEvolutionRuns] = useState<ForecastEvolutionRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Operational controls
  const [baseDemand, setBaseDemand] = useState<number>(32000);
  const [profileType, setProfileType] = useState<string>('winter_peak');
  const [safetyBuffer, setSafetyBuffer] = useState<number>(0);
  const [showActuals, setShowActuals] = useState<boolean>(true);
  const [showEvolution, setShowEvolution] = useState<boolean>(false);

  // Commercial Wholesale Order Ticket state
  const [orderType, setOrderType] = useState<'baseload' | 'peakload' | 'hourly'>('baseload');
  const [priceLimit, setPriceLimit] = useState<number>(85.0);
  const [selectedSpFilter, setSelectedSpFilter] = useState<'ALL' | 'SHORT' | 'LONG' | 'PEAK'>('ALL');

  // Balancing Cash-Out Simulator parameters
  const [daIndexPrice, setDaIndexPrice] = useState<number>(78.20);
  const [systemBuyPrice, setSystemBuyPrice] = useState<number>(145.00);
  const [systemSellPrice, setSystemSellPrice] = useState<number>(42.00);

  // Mobile layout tab switcher
  const [mobileTab, setMobileTab] = useState<'workbench' | 'ticket'>('workbench');

  // Fetch forecast data
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
        if (isMounted) setData(resp);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load forecast data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedDate, cutoffTime, baseDemand, profileType, safetyBuffer]);

  // Load forecast evolution when toggled
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

  // 48-Settlement Period Ladder computation (BSC 0.5h power to energy conversion)
  const settlementLadder = useMemo(() => {
    if (!data) return [];
    const rows = [];
    const actualMap = new Map<number, number>();
    (data.half_hourly_actuals || []).forEach(hh => {
      actualMap.set(hh.settlementPeriod, hh.generation);
    });

    for (let sp = 1; sp <= 48; sp++) {
      const hour = Math.floor((sp - 1) / 2);
      const isSecondHalf = (sp - 1) % 2 === 1;
      const timeStr = `${String(hour).padStart(2, '0')}:${isSecondHalf ? '30' : '00'}`;
      const seriesPoint = data.series[hour] || {
        forecast_mw: 0,
        actual_mw: 0,
        demand_mw: 0,
        net_thermal_mw: 0,
        buffered_thermal_mw: 0
      };

      // Half-hourly actual generation from FUELHH, falling back to hourly average
      const actualMw = actualMap.has(sp) ? (actualMap.get(sp) as number) : (seriesPoint.actual_mw ?? seriesPoint.forecast_mw);
      const forecastMw = seriesPoint.forecast_mw;
      const deltaMw = actualMw - forecastMw; // + = long (surplus), - = short (deficit)
      const demandMw = seriesPoint.demand_mw ?? baseDemand;
      const thermalReqMw = seriesPoint.net_thermal_mw ?? Math.max(0, demandMw - forecastMw);

      // BSC 0.5h conversion: Energy (MWh) = Power (MW) * 0.5 hours
      const imbalanceMwh = Math.abs(deltaMw) * 0.5;
      const windEnergyMwh = actualMw * 0.5;
      const forecastEnergyMwh = forecastMw * 0.5;
      const position = deltaMw < -50 ? 'SHORT' : deltaMw > 50 ? 'LONG' : 'BALANCED';

      // EFA Block Assignment
      let efaBlock = 1;
      let efaName = 'EFA 1';
      if (sp >= 7 && sp <= 14) { efaBlock = 2; efaName = 'EFA 2'; }
      else if (sp >= 15 && sp <= 22) { efaBlock = 3; efaName = 'EFA 3'; }
      else if (sp >= 23 && sp <= 30) { efaBlock = 4; efaName = 'EFA 4'; }
      else if (sp >= 31 && sp <= 38) { efaBlock = 5; efaName = 'EFA 5'; }
      else if (sp >= 39 && sp <= 46) { efaBlock = 6; efaName = 'EFA 6'; }
      else if (sp >= 47) { efaBlock = 1; efaName = 'EFA 1'; }

      rows.push({
        sp,
        spLabel: `SP${String(sp).padStart(2, '0')}`,
        timeStr,
        hour,
        efaBlock,
        efaName,
        forecastMw: Math.round(forecastMw),
        actualMw: Math.round(actualMw),
        deltaMw: Math.round(deltaMw),
        demandMw: Math.round(demandMw),
        thermalReqMw: Math.round(thermalReqMw),
        forecastEnergyMwh: Math.round(forecastEnergyMwh),
        windEnergyMwh: Math.round(windEnergyMwh),
        imbalanceMwh: Number(imbalanceMwh.toFixed(1)),
        position
      });
    }
    return rows;
  }, [data, baseDemand]);

  // Settlement ladder filter counts
  const ladderCounts = useMemo(() => {
    let shortCount = 0;
    let longCount = 0;
    let peakCount = 0;
    settlementLadder.forEach(r => {
      if (r.deltaMw < -50) shortCount++;
      if (r.deltaMw > 50) longCount++;
      if (r.sp >= 15 && r.sp <= 38) peakCount++;
    });
    return {
      all: settlementLadder.length,
      short: shortCount,
      long: longCount,
      peak: peakCount
    };
  }, [settlementLadder]);

  // Balancing Cash-out & Sensitivity Analysis
  const cashOutAnalysis = useMemo(() => {
    if (!settlementLadder.length || !data) {
      return {
        totalShortMwh: 0,
        totalLongMwh: 0,
        grossPenaltyExposure: 0,
        spillValueGbp: 0,
        p90ProtectedShortMwh: 0,
        p90AvoidedSurchargeGbp: 0,
        activeProtectedShortMwh: 0,
        activeAvoidedSurchargeGbp: 0,
        netCashOutSurcharge: 0,
        hedgedSavingsGbp: 0
      };
    }

    let totalShortMwh = 0;
    let totalLongMwh = 0;
    let p90ProtectedShortMwh = 0;
    let activeProtectedShortMwh = 0;

    // Empirical P90 buffer margin in MW
    const p90Mw = Math.round(data.metrics.p90_error > 0 ? data.metrics.p90_error : 850);
    const p90PeriodMwh = p90Mw * 0.5; // per 0.5h settlement period
    const activePeriodMwh = safetyBuffer * 0.5;

    settlementLadder.forEach(row => {
      if (row.deltaMw < 0) {
        const deficitMwh = Math.abs(row.deltaMw) * 0.5;
        totalShortMwh += deficitMwh;
        p90ProtectedShortMwh += Math.min(deficitMwh, p90PeriodMwh);
        if (safetyBuffer > 0) {
          activeProtectedShortMwh += Math.min(deficitMwh, activePeriodMwh);
        }
      } else {
        totalLongMwh += row.deltaMw * 0.5;
      }
    });

    // Cash-out penalty surcharge spread: (P_SBP - P_DA)
    const surchargeSpread = Math.max(0, systemBuyPrice - daIndexPrice);
    const grossPenaltyExposure = totalShortMwh * surchargeSpread;

    // Spill revenue outturn at System Sell Price
    const spillValueGbp = totalLongMwh * systemSellPrice;

    // Benchmark P90 avoided penalty surcharge
    const p90AvoidedSurchargeGbp = p90ProtectedShortMwh * surchargeSpread;

    // Active applied buffer avoided surcharge
    const activeAvoidedSurchargeGbp = activeProtectedShortMwh * surchargeSpread;

    // Hedged savings: active buffer if applied, else P90 benchmark
    const hedgedSavingsGbp = safetyBuffer > 0 ? activeAvoidedSurchargeGbp : p90AvoidedSurchargeGbp;
    const netCashOutSurcharge = Math.max(0, grossPenaltyExposure - hedgedSavingsGbp);

    return {
      totalShortMwh: Math.round(totalShortMwh),
      totalLongMwh: Math.round(totalLongMwh),
      grossPenaltyExposure: Math.round(grossPenaltyExposure),
      spillValueGbp: Math.round(spillValueGbp),
      p90ProtectedShortMwh: Math.round(p90ProtectedShortMwh),
      p90AvoidedSurchargeGbp: Math.round(p90AvoidedSurchargeGbp),
      activeProtectedShortMwh: Math.round(activeProtectedShortMwh),
      activeAvoidedSurchargeGbp: Math.round(activeAvoidedSurchargeGbp),
      netCashOutSurcharge: Math.round(netCashOutSurcharge),
      hedgedSavingsGbp: Math.round(hedgedSavingsGbp)
    };
  }, [settlementLadder, daIndexPrice, systemBuyPrice, systemSellPrice, safetyBuffer, data]);

  // Order volumes for staging ticket
  const ticketVolumes = useMemo(() => {
    if (!data) return { baseloadMw: 0, peakloadMw: 0, baseloadMwh: 0, peakloadMwh: 0 };
    const avgNetThermal = Math.round(data.procurement_summary.total_thermal_procured_mwh / 24);
    
    // Peakload = Hours 07:00 to 19:00 (12 hours)
    const peakSeries = data.series.slice(7, 19);
    const peakSumMwh = peakSeries.reduce((acc, curr) => acc + (curr.net_thermal_mw || 0), 0);
    const avgPeakThermal = Math.round(peakSumMwh / 12);

    return {
      baseloadMw: avgNetThermal,
      peakloadMw: avgPeakThermal,
      baseloadMwh: avgNetThermal * 24,
      peakloadMwh: avgPeakThermal * 12
    };
  }, [data]);

  // Trayport / EPEX SPOT Order Ticket CSV Export
  const handleExportTrayportCSV = () => {
    if (!data) return;
    const headers = 'Contract_Code,Market_Segment,Delivery_Date,Delivery_Start,Delivery_End,Side,Volume_MW,Price_GBP_MWh,Order_Type,Validity,Execution_Desk\n';
    let rows = '';

    if (orderType === 'baseload') {
      rows = `GB_DA_BASE,EPEX_SPOT_UK_DA,${data.delivery_date},00:00,24:00,BUY,${ticketVolumes.baseloadMw},${priceLimit.toFixed(2)},LIMIT,FOK,GRIDBRICKS_TERMINAL_DESK\n`;
    } else if (orderType === 'peakload') {
      rows = `GB_DA_PEAK,EPEX_SPOT_UK_DA,${data.delivery_date},07:00,19:00,BUY,${ticketVolumes.peakloadMw},${priceLimit.toFixed(2)},LIMIT,FOK,GRIDBRICKS_TERMINAL_DESK\n`;
    } else {
      // Hourly simple
      rows = data.series.map(s => {
        const start = `${String(s.hour).padStart(2, '0')}:00`;
        const end = s.hour === 23 ? '24:00' : `${String((s.hour + 1) % 24).padStart(2, '0')}:00`;
        const vol = Math.round(s.net_thermal_mw || 0);
        return `GB_DA_H${String(s.hour + 1).padStart(2, '0')},EPEX_SPOT_UK_DA,${data.delivery_date},${start},${end},BUY,${vol},${priceLimit.toFixed(2)},LIMIT,GTC,GRIDBRICKS_TERMINAL_DESK`;
      }).join('\n') + '\n';
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EPEX_TRAYPORT_TICKET_${data.delivery_date}_${orderType.toUpperCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Settlement Ladder CSV Export
  const handleExportLadderCSV = () => {
    if (!settlementLadder.length || !data) return;
    const headers = 'SP,Time_GMT,EFA_Block,Wind_Fcst_MW,Wind_Act_MW,Delta_MW,Demand_MW,Thermal_Req_MW,Imbalance_MWh,Position\n';
    const rows = settlementLadder.map(r => 
      `${r.spLabel},${r.timeStr},${r.efaName},${r.forecastMw},${r.actualMw},${r.deltaMw},${r.demandMw},${r.thermalReqMw},${r.position === 'SHORT' ? '-' : '+'}${r.imbalanceMwh},${r.position}`
    ).join('\n') + '\n';

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BSC_SETTLEMENT_LADDER_SP01_SP48_${data.delivery_date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400 font-mono">
        <Activity className="w-8 h-8 text-[#00D2FF] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider">Loading EPEX SPOT Day-Ahead Dispatch Order Book...</p>
        <span className="text-[10px] text-slate-500 mt-1">Elexon BMRS WINDFOR + FUELHH High-Resolution Matrix</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-[#0E131F] border border-[#EF4444] rounded-xs font-mono text-xs text-[#EF4444]">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>EPEX SPOT DATA DISPATCH ERROR</span>
        </div>
        <p className="text-slate-400">{error || 'Unknown trading system error'}</p>
      </div>
    );
  }

  const { series, metrics, procurement_summary: summary } = data;

  // Chart data: discrete stepAfter hourly blocks
  const stepChartData = series.map(s => ({
    hour: `${String(s.hour).padStart(2, '0')}:00`,
    'Wind Forecast': s.forecast_mw,
    'Total Demand': s.demand_mw,
    'Net Thermal Procured': s.net_thermal_mw,
    'Buffered Procurement': s.buffered_thermal_mw,
    'Actual Wind': showActuals ? s.actual_mw : null
  }));

  // Evolution chart data combining multi-runs
  const evolutionChartData = series.map(s => {
    const pt: any = {
      hour: `${String(s.hour).padStart(2, '0')}:00`,
      'Gate Closure Run': s.forecast_mw
    };
    evolutionRuns.forEach(r => {
      const p = r.points.find(x => x.startTime === s.startTime);
      const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
      pt[label] = p ? p.generation : null;
    });
    if (showActuals) pt['Actual Wind'] = s.actual_mw;
    return pt;
  });

  // Filter ladder rows if needed
  const filteredLadder = settlementLadder.filter(row => {
    if (selectedSpFilter === 'SHORT') return row.deltaMw < -50;
    if (selectedSpFilter === 'LONG') return row.deltaMw > 50;
    if (selectedSpFilter === 'PEAK') return row.sp >= 15 && row.sp <= 38; // EFA 3, 4, 5
    return true;
  });

  return (
    <div className="space-y-3 font-sans pb-8">
      {/* 1. Terminal Command Header Bar */}
      <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30 font-semibold uppercase">
                DAY-AHEAD DISPATCH WORKBENCH
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                UK NATIONAL GRID ESO // ELEXON BALANCING MECHANISM
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-mono text-white font-bold">
                DELIVERY DATE: <span className="text-[#10B981]">{data.delivery_date}</span>
              </span>
              <span className="text-slate-500 font-mono">•</span>
              <span className="text-xs font-mono text-slate-300">
                Decision: <span className="text-[#00D2FF] font-semibold">{data.decision_date}</span> at <span className="text-[#FF9F1C] font-semibold">{cutoffTime} GMT Gate Closure</span>
              </span>
              <span className="text-slate-500 font-mono hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Run: <code className="text-slate-200">{data.latest_publish_run?.substring(11, 16) || '11:00'} UTC</code>
              </span>
            </div>
          </div>

          {/* Date & Cutoff Selector & CSV Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#0A0E17] border border-[#1A2234] rounded-xs px-2 py-1 text-xs font-mono">
              <span className="text-slate-500 text-[10px] uppercase">DATE:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                {dates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date} className="bg-[#0A0E17] text-slate-200">
                    {d.decision_date} (Delivery: {d.delivery_date})
                  </option>
                ))}
              </select>
            </div>

            {setCutoffTime && (
              <div className="flex items-center gap-1.5 bg-[#0A0E17] border border-[#1A2234] rounded-xs px-2 py-1 text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase">CUTOFF:</span>
                <select
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="bg-transparent text-[#00D2FF] font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value="08:00" className="bg-[#0A0E17] text-slate-200">08:00 GMT</option>
                  <option value="09:30" className="bg-[#0A0E17] text-slate-200">09:30 GMT</option>
                  <option value="11:00" className="bg-[#0A0E17] text-[#00D2FF]">11:00 GMT (EPEX DA)</option>
                  <option value="14:00" className="bg-[#0A0E17] text-slate-200">14:00 GMT</option>
                  <option value="17:00" className="bg-[#0A0E17] text-slate-200">17:00 GMT</option>
                </select>
              </div>
            )}

            <button
              onClick={handleExportLadderCSV}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1A2234] hover:bg-[#25324d] text-slate-200 border border-[#2a3754] rounded-xs text-xs font-mono transition"
              title="Export 48 Settlement Periods to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>SP LADDER CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-[#0E131F] border border-[#1A2234] p-1 rounded-xs font-mono text-xs">
        <button
          onClick={() => setMobileTab('workbench')}
          className={`flex-1 py-1.5 text-center transition-colors ${
            mobileTab === 'workbench'
              ? 'bg-[#151C2C] text-[#00D2FF] font-bold border-b-2 border-b-[#00D2FF]'
              : 'text-slate-400'
          }`}
        >
          DISPATCH & LADDER (65%)
        </button>
        <button
          onClick={() => setMobileTab('ticket')}
          className={`flex-1 py-1.5 text-center transition-colors ${
            mobileTab === 'ticket'
              ? 'bg-[#151C2C] text-[#FF9F1C] font-bold border-b-2 border-b-[#FF9F1C]'
              : 'text-slate-400'
          }`}
        >
          ORDER TICKET & CASH-OUT (35%)
        </button>
      </div>

      {/* 2. Main Full-Bleed 65% / 35% Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ========================================================
            LEFT PANE: OPERATIONAL DESK (65% width / col-span-8)
            ======================================================== */}
        <div className={`lg:col-span-8 space-y-3 ${mobileTab === 'ticket' ? 'hidden lg:block' : 'block'}`}>
          {/* A. Compact Command Strip (4 Dense Rectangular KPI Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricsCard
              title="Wind Gen Supply"
              value={Math.round(summary.total_wind_forecast_mwh).toLocaleString()}
              unit="MWh"
              subtitle={`Penetration: ${summary.wind_penetration_pct}% load`}
              icon={Wind}
              trend="wind"
              trendText="Supply Forecast"
            />
            <MetricsCard
              title="Thermal To Procure"
              value={Math.round(summary.total_thermal_procured_mwh).toLocaleString()}
              unit="MWh"
              subtitle={`Covers ${summary.thermal_share_pct}% net gap`}
              icon={Flame}
              trend="warning"
              trendText="Auction Volume"
            />
            <MetricsCard
              title="Forecast MAE Error"
              value={metrics.mae.toLocaleString()}
              unit="MW"
              subtitle={`WAPE: ${metrics.wape}% | Bias: ${metrics.mean_bias > 0 ? '+' : ''}${metrics.mean_bias}MW`}
              icon={TrendingUp}
              trend={metrics.wape < 12 ? 'positive' : 'negative'}
              trendText={`P90: ${Math.round(metrics.p90_error)}MW`}
            />
            <MetricsCard
              title="P90 Risk Hedge Reserve"
              value={safetyBuffer > 0 ? `+${safetyBuffer * 24}` : '0'}
              unit="MWh"
              subtitle={safetyBuffer > 0 ? `Buffer +${safetyBuffer} MW/h active` : 'P50 unhedged baseline'}
              icon={ShieldAlert}
              trend={safetyBuffer > 0 ? 'hedge' : 'neutral'}
              trendText={safetyBuffer > 0 ? 'Protected' : 'No Reserve'}
            />
          </div>

          {/* B. Wholesale Step Dispatch Chart (Hourly Committed Market Blocks + Stark Actuals) */}
          <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white tracking-tight uppercase">
                  Wholesale Step Dispatch Profile (Hourly Delivery Blocks)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#1A2234] text-slate-300">
                  MW Profile
                </span>
              </div>

              {/* Chart Overlay Toggles */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setShowActuals(!showActuals)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[11px] transition ${
                    showActuals
                      ? 'bg-white/10 border-white/40 text-white font-semibold'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-500'
                  }`}
                  title="Toggle physical actual wind generation line"
                >
                  <Eye className="w-3 h-3 text-white" />
                  <span>Stark Actuals (#FFF)</span>
                </button>

                <button
                  onClick={() => setShowEvolution(!showEvolution)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[11px] transition ${
                    showEvolution
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD] font-semibold'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-500'
                  }`}
                  title="Compare forecast evolution from prior runs"
                >
                  <Activity className="w-3 h-3 text-[#A78BFA]" />
                  <span>Evolution Runs</span>
                </button>
              </div>
            </div>

            {/* Step Chart Area */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {!showEvolution ? (
                  <AreaChart data={stepChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="windStepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00D2FF" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="thermalStepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9F1C" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#121824" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#475569" 
                      tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                      interval={2}
                    />
                    <YAxis 
                      stroke="#475569" 
                      tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                      unit=" MW"
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0E17', 
                        borderColor: '#1A2234', 
                        borderRadius: '2px', 
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.7)'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }} />

                    {/* Baseline Customer Demand Line */}
                    <Line 
                      type="stepAfter" 
                      dataKey="Total Demand" 
                      stroke="#94A3B8" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 3"
                      dot={false}
                    />

                    {/* Forecasted Wind Step Area */}
                    <Area 
                      type="stepAfter" 
                      dataKey="Wind Forecast" 
                      stroke="#00D2FF" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#windStepGrad)" 
                    />

                    {/* Net Thermal Required Step Area */}
                    <Area 
                      type="stepAfter" 
                      dataKey="Net Thermal Procured" 
                      stroke="#FF9F1C" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#thermalStepGrad)" 
                    />

                    {/* Buffered Thermal Step Line */}
                    {safetyBuffer > 0 && (
                      <Line 
                        type="stepAfter" 
                        dataKey="Buffered Procurement" 
                        stroke="#8B5CF6" 
                        strokeWidth={2} 
                        strokeDasharray="3 3"
                        dot={false}
                      />
                    )}

                    {/* Physical Actual Generation: Stark Solid White #FFFFFF */}
                    {showActuals && (
                      <Line 
                        type="stepAfter" 
                        dataKey="Actual Wind" 
                        stroke="#FFFFFF" 
                        strokeWidth={2.5} 
                        dot={{ r: 2, fill: '#FFFFFF' }}
                      />
                    )}
                  </AreaChart>
                ) : (
                  <LineChart data={evolutionChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#121824" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#475569" 
                      tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
                      interval={2}
                    />
                    <YAxis 
                      stroke="#475569" 
                      tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} 
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
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }} />

                    <Line 
                      type="stepAfter" 
                      dataKey="Gate Closure Run" 
                      stroke="#00D2FF" 
                      strokeWidth={2.5} 
                      dot={false} 
                    />

                    {evolutionRuns.map((r, i) => {
                      const colors = ['#8B5CF6', '#A855F7', '#C084FC', '#E879F9'];
                      const label = `Run ${r.publishTime.substring(11, 16)} UTC`;
                      return (
                        <Line
                          key={r.publishTime}
                          type="stepAfter"
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
                        type="stepAfter" 
                        dataKey="Actual Wind" 
                        stroke="#FFFFFF" 
                        strokeWidth={2.5} 
                        dot={false} 
                      />
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* C. 6 UK EFA Blocks Ribbon (European Format Axis 1 to 6) */}
            <div className="mt-2 pt-2 border-t border-[#121824]">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  UK EFA Blocks (European Format Axis 4h Contract Standard):
                </span>
                <span className="text-slate-500">SP01 (00:00 GMT) → SP48 (24:00 GMT)</span>
              </div>
              <div className="grid grid-cols-6 gap-1 font-mono text-[10px] text-center">
                {EFA_BLOCKS.map(efa => (
                  <div
                    key={efa.id}
                    className="p-1 rounded-xs border border-[#1A2234] bg-[#0A0E17]"
                    style={{ borderTop: `2px solid ${efa.color}` }}
                  >
                    <div className="font-bold text-white truncate">{efa.name.split(':')[0]}</div>
                    <div className="text-[9px] text-slate-400 truncate">{efa.hours}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{efa.spRange}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* D. 48-Period Settlement Period Ladder (SP01–SP48) */}
          <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    48-Settlement Period Matrix (SP01–SP48)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    BSC 0.5h Rule: MWh = MW × 0.5h
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Synchronized half-hourly cash-out imbalance ledger for delivery day {data.delivery_date}.
                </p>
              </div>

              {/* Ladder Filter Controls with Live Counts */}
              <div className="flex items-center gap-1 font-mono text-[10px] bg-[#0A0E17] p-0.5 rounded-xs border border-[#1A2234]">
                <button
                  onClick={() => setSelectedSpFilter('ALL')}
                  className={`px-2 py-0.5 rounded-xs transition ${
                    selectedSpFilter === 'ALL' ? 'bg-[#151C2C] text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ALL ({ladderCounts.all})
                </button>
                <button
                  onClick={() => setSelectedSpFilter('SHORT')}
                  className={`px-2 py-0.5 rounded-xs transition ${
                    selectedSpFilter === 'SHORT' ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SHORT ({ladderCounts.short})
                </button>
                <button
                  onClick={() => setSelectedSpFilter('LONG')}
                  className={`px-2 py-0.5 rounded-xs transition ${
                    selectedSpFilter === 'LONG' ? 'bg-[#10B981]/20 text-[#10B981] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LONG ({ladderCounts.long})
                </button>
                <button
                  onClick={() => setSelectedSpFilter('PEAK')}
                  className={`px-2 py-0.5 rounded-xs transition ${
                    selectedSpFilter === 'PEAK' ? 'bg-[#FF9F1C]/20 text-[#FF9F1C] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PEAK ({ladderCounts.peak})
                </button>
              </div>
            </div>

            {/* Scrollable 48-Period Table with Sticky Header */}
            <div className="border border-[#1A2234] rounded-xs overflow-hidden max-h-[360px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead className="sticky top-0 z-10 bg-[#0A0E17] text-slate-400 border-b border-[#1A2234] text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-1.5 px-2 font-medium">SP</th>
                    <th className="py-1.5 px-2 font-medium">Time</th>
                    <th className="py-1.5 px-1 font-medium">EFA</th>
                    <th className="py-1.5 px-2 text-right font-medium text-[#00D2FF]">Fcst (MW)</th>
                    <th className="py-1.5 px-2 text-right font-medium text-white">Act (MW)</th>
                    <th className="py-1.5 px-2 text-right font-medium">Delta (MW)</th>
                    <th className="py-1.5 px-2 text-right font-medium text-slate-400">Demand (MW)</th>
                    <th className="py-1.5 px-2 text-right font-medium text-[#FF9F1C]">Thermal (MW)</th>
                    <th className="py-1.5 px-2 text-right font-medium">Imb (MWh)</th>
                    <th className="py-1.5 px-2 text-center font-medium">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121824] bg-[#080B10]">
                  {filteredLadder.map(row => (
                    <tr 
                      key={row.sp} 
                      className="h-6 hover:bg-[#151C2C] transition-colors tabular-nums"
                    >
                      <td className="py-1 px-2 font-semibold text-slate-300">{row.spLabel}</td>
                      <td className="py-1 px-2 text-slate-400">{row.timeStr}</td>
                      <td className="py-1 px-1 text-[9px] text-slate-500">{row.efaName}</td>
                      <td className="py-1 px-2 text-right text-[#00D2FF]">{row.forecastMw.toLocaleString()}</td>
                      <td className="py-1 px-2 text-right text-white font-medium">{row.actualMw.toLocaleString()}</td>
                      <td className={`py-1 px-2 text-right font-medium ${
                        row.deltaMw < -50 ? 'text-[#EF4444]' : row.deltaMw > 50 ? 'text-[#10B981]' : 'text-slate-400'
                      }`}>
                        {row.deltaMw > 0 ? `+${row.deltaMw}` : row.deltaMw}
                      </td>
                      <td className="py-1 px-2 text-right text-slate-400">{row.demandMw.toLocaleString()}</td>
                      <td className="py-1 px-2 text-right text-[#FF9F1C] font-medium">{row.thermalReqMw.toLocaleString()}</td>
                      <td className={`py-1 px-2 text-right font-semibold ${
                        row.position === 'SHORT' ? 'text-[#EF4444]' : row.position === 'LONG' ? 'text-[#10B981]' : 'text-slate-300'
                      }`}>
                        {row.position === 'SHORT' ? `-${row.imbalanceMwh}` : row.position === 'LONG' ? `+${row.imbalanceMwh}` : '0.0'}
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.2 rounded-xs text-[9px] font-bold border ${
                          row.position === 'SHORT'
                            ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
                            : row.position === 'LONG'
                            ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
                            : 'text-slate-400 bg-slate-800/40 border-slate-700'
                        }`}>
                          {row.position}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary statistics footer for ladder */}
            <div className="mt-2 pt-2 border-t border-[#121824] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span>Showing: <strong className="text-white">{filteredLadder.length}</strong> / 48 SPs (24h Delivery)</span>
                <span>•</span>
                <span>Net System Imbalance: <strong className={cashOutAnalysis.totalShortMwh > cashOutAnalysis.totalLongMwh ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                  {cashOutAnalysis.totalLongMwh - cashOutAnalysis.totalShortMwh > 0 ? '+' : ''}
                  {(cashOutAnalysis.totalLongMwh - cashOutAnalysis.totalShortMwh).toLocaleString()} MWh
                </strong></span>
              </div>
              <div className="text-[10px] text-slate-500">
                1 MWh = 2 × 0.5h Settlement Periods
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT PANE: EXECUTION DESK (35% width / col-span-4)
            ======================================================== */}
        <div className={`lg:col-span-4 space-y-3 ${mobileTab === 'workbench' ? 'hidden lg:block' : 'block'}`}>
          {/* A. EPEX SPOT UK Wholesale Auction Order Staging Ticket */}
          <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A2234] pb-2">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-tight">
                  EPEX Auction Order Ticket
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#1A2234] text-slate-300">
                EPEX_GB_DA
              </span>
            </div>

            {/* Contract Type Selector */}
            <div className="space-y-1 font-mono text-xs">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Contract Structure</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setOrderType('baseload')}
                  className={`py-1 px-1 text-center rounded-xs text-[11px] font-semibold transition border ${
                    orderType === 'baseload'
                      ? 'bg-[#00D2FF]/15 border-[#00D2FF]/50 text-[#00D2FF]'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-400 hover:text-white'
                  }`}
                >
                  Baseload (24h)
                </button>
                <button
                  onClick={() => setOrderType('peakload')}
                  className={`py-1 px-1 text-center rounded-xs text-[11px] font-semibold transition border ${
                    orderType === 'peakload'
                      ? 'bg-[#00D2FF]/15 border-[#00D2FF]/50 text-[#00D2FF]'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-400 hover:text-white'
                  }`}
                >
                  Peak (07-19)
                </button>
                <button
                  onClick={() => setOrderType('hourly')}
                  className={`py-1 px-1 text-center rounded-xs text-[11px] font-semibold transition border ${
                    orderType === 'hourly'
                      ? 'bg-[#00D2FF]/15 border-[#00D2FF]/50 text-[#00D2FF]'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-400 hover:text-white'
                  }`}
                >
                  24h Hourly
                </button>
              </div>
            </div>

            {/* Order Specification Summary Box */}
            <div className="bg-[#0A0E17] border border-[#1A2234] rounded-xs p-2.5 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Contract Volume:</span>
                <span className="font-bold text-white tabular-nums">
                  {orderType === 'baseload' ? `${ticketVolumes.baseloadMw.toLocaleString()} MW (Flat 24h)` :
                   orderType === 'peakload' ? `${ticketVolumes.peakloadMw.toLocaleString()} MW (12h Peak)` :
                   '24 Discrete Hourly Orders'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Total Energy Volume:</span>
                <span className="font-bold text-[#FF9F1C] tabular-nums">
                  {orderType === 'baseload' ? `${ticketVolumes.baseloadMwh.toLocaleString()} MWh` :
                   orderType === 'peakload' ? `${ticketVolumes.peakloadMwh.toLocaleString()} MWh` :
                   `${Math.round(summary.total_thermal_procured_mwh).toLocaleString()} MWh`}
                </span>
              </div>

              {/* Price Limit Input */}
              <div className="pt-2 border-t border-[#121824] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase">Limit Price:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-xs">£</span>
                  <input
                    type="number"
                    step="0.5"
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(Number(e.target.value))}
                    className="w-20 bg-[#080B10] border border-[#1A2234] px-1.5 py-0.5 rounded-xs text-right font-mono text-xs text-white focus:outline-none focus:border-[#00D2FF]"
                  />
                  <span className="text-slate-500 text-[10px]">/MWh</span>
                </div>
              </div>
            </div>

            {/* 1-Click Export Trayport / EPEX CSV Button */}
            <button
              onClick={handleExportTrayportCSV}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#00D2FF] hover:bg-[#00c0eb] text-slate-950 rounded-xs font-mono text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT TRAYPORT / EPEX CSV</span>
            </button>
          </div>

          {/* B. Balancing Cash-Out Imbalance & P&L Sensitivity Model */}
          <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A2234] pb-2">
              <div className="flex items-center gap-1.5">
                <PoundSterling className="w-4 h-4 text-[#EF4444]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-tight">
                  Balancing Cash-Out Sensitivity
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#EF4444]/15 text-[#EF4444]">
                ELEXON SBP
              </span>
            </div>

            <p className="text-[10px] font-mono text-slate-400">
              Imbalance Surcharge = Deficit MWh × (P_SBP − P_DA).
            </p>

            {/* Price Sliders */}
            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Day-Ahead Index (P_DA):</span>
                  <span className="text-white font-bold">£{daIndexPrice.toFixed(2)}/MWh</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={130}
                  step={1}
                  value={daIndexPrice}
                  onChange={(e) => setDaIndexPrice(Number(e.target.value))}
                  className="w-full accent-[#00D2FF] bg-[#0A0E17] h-1.5 rounded-xs cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">System Buy Price (P_SBP Penalty):</span>
                  <span className="text-[#EF4444] font-bold">£{systemBuyPrice.toFixed(2)}/MWh</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={250}
                  step={5}
                  value={systemBuyPrice}
                  onChange={(e) => setSystemBuyPrice(Number(e.target.value))}
                  className="w-full accent-[#EF4444] bg-[#0A0E17] h-1.5 rounded-xs cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">System Sell Price (P_SSP Spill):</span>
                  <span className="text-[#10B981] font-bold">£{systemSellPrice.toFixed(2)}/MWh</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={2}
                  value={systemSellPrice}
                  onChange={(e) => setSystemSellPrice(Number(e.target.value))}
                  className="w-full accent-[#10B981] bg-[#0A0E17] h-1.5 rounded-xs cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive Surcharge & Hedged Savings Display */}
            <div className="bg-[#0A0E17] border border-[#1A2234] rounded-xs p-2.5 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Gross Short Deficit:</span>
                <span className="text-[#EF4444] font-bold tabular-nums">
                  {cashOutAnalysis.totalShortMwh.toLocaleString()} MWh
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Cash-Out Penalty Spread:</span>
                <span className="text-slate-200 font-bold tabular-nums">
                  +£{(systemBuyPrice - daIndexPrice).toFixed(2)}/MWh
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Unhedged Penalty Exposure:</span>
                <span className="text-[#EF4444] font-bold tabular-nums">
                  £{cashOutAnalysis.grossPenaltyExposure.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Long Spill Cash-Out:</span>
                <span className="text-[#10B981] font-bold tabular-nums">
                  £{cashOutAnalysis.spillValueGbp.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">({cashOutAnalysis.totalLongMwh.toLocaleString()} MWh)</span>
                </span>
              </div>

              {/* P90 Hedge Protection Callout */}
              <div className="pt-2 border-t border-[#121824] flex justify-between items-center bg-[#10B981]/10 -mx-2.5 -mb-2.5 p-2 rounded-b-xs border-t border-[#10B981]/25">
                <div>
                  <span className="text-[10px] text-[#10B981] font-bold block uppercase tracking-wider">
                    {safetyBuffer > 0 ? `Active Buffer Savings (+${safetyBuffer} MW):` : 'P90 Buffer Avoided Surcharge:'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {safetyBuffer > 0 ? `Covers ${cashOutAnalysis.activeProtectedShortMwh.toLocaleString()} MWh deficit` : `Protects ${cashOutAnalysis.p90ProtectedShortMwh.toLocaleString()} MWh deficit`}
                  </span>
                </div>
                <span className="text-sm font-bold font-mono text-[#10B981] tabular-nums">
                  +£{cashOutAnalysis.hedgedSavingsGbp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick 1-Click P90 Buffer Action */}
            <div className="pt-1">
              <button
                onClick={() => setSafetyBuffer(safetyBuffer > 0 ? 0 : (metrics.p90_error > 0 ? Math.round(metrics.p90_error) : 850))}
                className={`w-full py-1.5 px-2 border rounded-xs text-[11px] font-mono font-semibold transition ${
                  safetyBuffer > 0
                    ? 'bg-[#8B5CF6]/30 border-[#8B5CF6] text-white'
                    : 'bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border-[#8B5CF6]/40 text-[#C4B5FD]'
                }`}
              >
                {safetyBuffer > 0 
                  ? `Active: +${safetyBuffer} MW P90 Margin Applied (Click to Reset)`
                  : `1-Click: Commit P90 Risk Margin (+${Math.round(metrics.p90_error)} MW to Plan)`}
              </button>
            </div>
          </div>

          {/* C. Simulation Parameter Adjustments */}
          <div className="bg-[#0E131F] border border-[#1A2234] rounded-xs p-3.5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1A2234] pb-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-white uppercase tracking-tight">
                  Portfolio Load Settings
                </span>
              </div>
              <span className="text-[9px] text-slate-500">ESO MODEL</span>
            </div>

            {/* Base Demand */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Utility Peak Demand:</span>
                <span className="text-white font-bold">{baseDemand.toLocaleString()} MW</span>
              </div>
              <input
                type="range"
                min={15000}
                max={45000}
                step={500}
                value={baseDemand}
                onChange={(e) => setBaseDemand(Number(e.target.value))}
                className="w-full accent-[#00D2FF] bg-[#0A0E17] h-1.5 rounded-xs cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>15k MW</span>
                <span>Typical: 32k MW</span>
                <span>45k MW</span>
              </div>
            </div>

            {/* Demand Profile */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Demand Profile</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setProfileType('winter_peak')}
                  className={`py-1 px-1.5 text-center rounded-xs text-[11px] transition border ${
                    profileType === 'winter_peak'
                      ? 'bg-[#151C2C] border-[#00D2FF]/50 text-[#00D2FF] font-semibold'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-400'
                  }`}
                >
                  Winter Peak (ESO)
                </button>
                <button
                  onClick={() => setProfileType('flat')}
                  className={`py-1 px-1.5 text-center rounded-xs text-[11px] transition border ${
                    profileType === 'flat'
                      ? 'bg-[#151C2C] border-[#00D2FF]/50 text-[#00D2FF] font-semibold'
                      : 'bg-[#0A0E17] border-[#1A2234] text-slate-400'
                  }`}
                >
                  Flat Baseload
                </button>
              </div>
            </div>

            {/* Hedging Buffer */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Hedging Buffer Reserve:</span>
                <span className="text-[#8B5CF6] font-bold">+{safetyBuffer} MW / hr</span>
              </div>
              <input
                type="range"
                min={0}
                max={2500}
                step={50}
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                className="w-full accent-[#8B5CF6] bg-[#0A0E17] h-1.5 rounded-xs cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
