export interface DecisionDateOption {
  decision_date: string;
  delivery_date: string;
  label: string;
}

export interface HourlyPoint {
  startTime: string;
  hour: number;
  publishTime: string;
  forecast_mw: number;
  actual_mw: number | null;
  error_mw: number | null;
  abs_error_mw: number | null;
  demand_mw?: number;
  net_thermal_mw?: number;
  buffered_thermal_mw?: number;
  surplus_wind_mw?: number;
}

export interface AccuracyMetrics {
  count: number;
  mae: number;
  rmse: number;
  wape: number;
  mean_bias: number;
  r_squared: number;
  p10_error: number;
  p50_error: number;
  p90_error: number;
  max_overprediction: number;
  max_underprediction: number;
  mean_actual: number;
  mean_forecast: number;
}

export interface ProcurementSummary {
  total_demand_mwh: number;
  total_wind_forecast_mwh: number;
  total_thermal_procured_mwh: number;
  total_buffered_procured_mwh: number;
  wind_penetration_pct: number;
  thermal_share_pct: number;
  buffer_reserve_mwh: number;
}

export interface WeatherRegime {
  regime: string;
  code: string;
  mean_wind_gw: number;
  peak_ramp_mw_hr: number;
  headline: string;
  description: string;
  avoided_cashout_surcharge_gbp: number;
}

export interface DayAheadForecastResponse {
  decision_date: string;
  cutoff_time: string;
  delivery_date: string;
  latest_publish_run: string | null;
  series: HourlyPoint[];
  half_hourly_actuals: {
    startTime: string;
    settlementPeriod: number;
    generation: number;
  }[];
  metrics: AccuracyMetrics;
  procurement_summary: ProcurementSummary;
  weather_regime?: WeatherRegime;
}

export interface ForecastEvolutionRun {
  publishTime: string;
  points: {
    startTime: string;
    generation: number;
  }[];
}

export interface DailySummary {
  decision_date: string;
  delivery_date: string;
  mae: number;
  rmse: number;
  wape: number;
  mean_bias: number;
  mean_actual: number;
  mean_forecast: number;
  r_squared: number;
}

export interface DiurnalPoint {
  hour: number;
  hour_label: string;
  mean_actual: number;
  mean_forecast: number;
  mae: number;
  rmse: number;
  mean_bias: number;
  wape: number;
}

export interface ResidualBin {
  range_label: string;
  bin_center: number;
  count: number;
}

export interface MonthlyAccuracyResponse {
  cutoff_time: string;
  overall_kpis: AccuracyMetrics;
  daily_breakdown: DailySummary[];
  diurnal_profile: DiurnalPoint[];
  residuals_histogram: ResidualBin[];
  total_evaluated_hours: number;
}
