import type {
  DecisionDateOption,
  DayAheadForecastResponse,
  ForecastEvolutionRun,
  MonthlyAccuracyResponse
} from '../types';

const BASE_URL = '/api';

export async function getDates(): Promise<DecisionDateOption[]> {
  const res = await fetch(`${BASE_URL}/dates`);
  if (!res.ok) throw new Error('Failed to fetch available dates');
  const data = await res.json();
  return data.dates;
}

export async function getLatestForecast(params: {
  decision_date: string;
  cutoff_time?: string;
  base_demand_mw?: number;
  profile_type?: string;
  p90_buffer_mw?: number;
}): Promise<DayAheadForecastResponse> {
  const query = new URLSearchParams({
    decision_date: params.decision_date,
    cutoff_time: params.cutoff_time || '11:00',
    base_demand_mw: String(params.base_demand_mw ?? 32000),
    profile_type: params.profile_type || 'winter_peak',
    p90_buffer_mw: String(params.p90_buffer_mw ?? 0)
  });
  const res = await fetch(`${BASE_URL}/forecast/latest?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch latest forecast');
  return res.json();
}

export async function getForecastEvolution(
  decision_date: string,
  delivery_date: string
): Promise<ForecastEvolutionRun[]> {
  const query = new URLSearchParams({ decision_date, delivery_date });
  const res = await fetch(`${BASE_URL}/forecast/evolution?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch forecast evolution');
  const data = await res.json();
  return data.runs;
}

export async function getMonthlyAccuracy(
  cutoff_time: string = '11:00'
): Promise<MonthlyAccuracyResponse> {
  const query = new URLSearchParams({ cutoff_time });
  const res = await fetch(`${BASE_URL}/accuracy/monthly?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch monthly accuracy');
  return res.json();
}

export async function syncElexonData(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE_URL}/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger data sync');
  return res.json();
}
