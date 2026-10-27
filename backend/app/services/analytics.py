"""
Quantitative Analytics Engine for UK Wind Generation & Day-Ahead Power Procurement
Provides mathematical formulations for forecast error evaluation and risk management:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- WAPE (Weighted Absolute Percentage Error)
- Mean Bias (Forecast - Actual)
- R-squared (Coefficient of Determination)
- Residual Quantiles (P10, P50, P90, P95) & Safety Margin Buffer
- Thermal Procurement Gap & Imbalance Exposure
"""

import math
from typing import List, Dict, Any, Optional

def calculate_kpis(actuals: List[float], forecasts: List[float]) -> Dict[str, Any]:
    """
    Computes standard and wholesale-energy-specific accuracy metrics.
    """
    if not actuals or not forecasts or len(actuals) != len(forecasts):
        return {
            "count": 0,
            "mae": 0.0,
            "rmse": 0.0,
            "wape": 0.0,
            "mean_bias": 0.0,
            "r_squared": 0.0,
            "p10_error": 0.0,
            "p50_error": 0.0,
            "p90_error": 0.0,
            "max_overprediction": 0.0,
            "max_underprediction": 0.0,
            "mean_actual": 0.0,
            "mean_forecast": 0.0,
        }

    n = len(actuals)
    errors = [f - a for f, a in zip(forecasts, actuals)]
    abs_errors = [abs(e) for e in errors]

    mae = sum(abs_errors) / n
    mse = sum(e ** 2 for e in errors) / n
    rmse = math.sqrt(mse)
    mean_bias = sum(errors) / n

    total_actual = sum(actuals)
    wape = (sum(abs_errors) / total_actual * 100.0) if total_actual > 0 else 0.0

    # R-squared calculation
    mean_act = total_actual / n
    mean_fc = sum(forecasts) / n
    ss_tot = sum((a - mean_act) ** 2 for a in actuals)
    ss_res = sum(e ** 2 for e in errors)
    if ss_tot > 1e-9:
        r2 = max(0.0, 1.0 - (ss_res / ss_tot))
    else:
        r2 = 1.0 if ss_res < 1e-9 else 0.0

    # Quantiles of error (e = forecast - actual)
    sorted_errors = sorted(errors)
    def quantile(sorted_arr, q):
        idx = (len(sorted_arr) - 1) * q
        low = int(math.floor(idx))
        high = int(math.ceil(idx))
        if low == high:
            return sorted_arr[low]
        weight = idx - low
        return sorted_arr[low] * (1 - weight) + sorted_arr[high] * weight

    p10 = quantile(sorted_errors, 0.10)
    p50 = quantile(sorted_errors, 0.50)
    p90 = quantile(sorted_errors, 0.90)

    return {
        "count": n,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "wape": round(wape, 2),
        "mean_bias": round(mean_bias, 2),
        "r_squared": round(r2, 4),
        "p10_error": round(p10, 2),
        "p50_error": round(p50, 2),
        "p90_error": round(p90, 2),
        "max_overprediction": round(max(errors), 2),
        "max_underprediction": round(min(errors), 2),
        "mean_actual": round(mean_act, 2),
        "mean_forecast": round(mean_fc, 2),
    }

def get_hourly_load_multipliers(profile: str = "winter_peak") -> List[float]:
    """
    Standard normalized UK winter electricity demand profile across 24 hours (0 to 23).
    Averages 1.0 across the day with morning (07-09) and evening (17-20) peaks.
    """
    if profile == "flat":
        return [1.0] * 24

    # Realistic UK winter diurnal load shape (National Grid ESO typical shape)
    profile_factors = [
        0.72, 0.68, 0.66, 0.65, 0.68, 0.78, 0.95, 1.15, 1.18, 1.12, # 00:00 - 09:00
        1.10, 1.08, 1.07, 1.06, 1.05, 1.08, 1.18, 1.25, 1.22, 1.14, # 10:00 - 19:00
        1.05, 0.95, 0.85, 0.76                                       # 20:00 - 23:00
    ]
    mean_val = sum(profile_factors) / len(profile_factors)
    return [round(f / mean_val, 3) for f in profile_factors]

def calculate_procurement_schedule(
    forecast_points: List[Dict[str, Any]],
    base_demand_mw: float = 32000.0,
    profile_type: str = "winter_peak",
    p90_buffer_mw: float = 0.0
) -> Dict[str, Any]:
    """
    Computes the Day-Ahead thermal procurement requirement:
    Net Residual Thermal Demand = max(0, Demand - Forecasted Wind)
    Risk-Buffered Demand = max(0, Demand - (Forecasted Wind - Buffer))
    """
    multipliers = get_hourly_load_multipliers(profile_type)
    schedule = []
    total_demand_mwh = 0.0
    total_wind_forecast_mwh = 0.0
    total_thermal_procured_mwh = 0.0
    total_buffered_procured_mwh = 0.0

    for idx, pt in enumerate(forecast_points):
        hour = idx % 24
        factor = multipliers[hour] if hour < len(multipliers) else 1.0
        demand = round(base_demand_mw * factor, 1)
        wind_fc = float(pt.get("generation", 0.0))

        # Net thermal procurement without buffer
        net_thermal = max(0.0, demand - wind_fc)
        surplus_wind = max(0.0, wind_fc - demand)

        # Conservative procurement with risk buffer (hedging against forecast overestimation)
        conservative_wind = max(0.0, wind_fc - p90_buffer_mw)
        buffered_thermal = max(0.0, demand - conservative_wind)

        schedule.append({
            "startTime": pt.get("startTime"),
            "hour": hour,
            "demand_mw": demand,
            "wind_forecast_mw": round(wind_fc, 1),
            "net_thermal_mw": round(net_thermal, 1),
            "buffered_thermal_mw": round(buffered_thermal, 1),
            "surplus_wind_mw": round(surplus_wind, 1),
            "safety_buffer_mw": round(p90_buffer_mw, 1)
        })

        # For 1-hour resolution, 1 MW for 1 hour = 1 MWh
        total_demand_mwh += demand
        total_wind_forecast_mwh += wind_fc
        total_thermal_procured_mwh += net_thermal
        total_buffered_procured_mwh += buffered_thermal

    return {
        "schedule": schedule,
        "summary": {
            "total_demand_mwh": round(total_demand_mwh, 1),
            "total_wind_forecast_mwh": round(total_wind_forecast_mwh, 1),
            "total_thermal_procured_mwh": round(total_thermal_procured_mwh, 1),
            "total_buffered_procured_mwh": round(total_buffered_procured_mwh, 1),
            "wind_penetration_pct": round((total_wind_forecast_mwh / total_demand_mwh * 100), 2) if total_demand_mwh > 0 else 0.0,
            "thermal_share_pct": round((total_thermal_procured_mwh / total_demand_mwh * 100), 2) if total_demand_mwh > 0 else 0.0,
            "buffer_reserve_mwh": round(total_buffered_procured_mwh - total_thermal_procured_mwh, 1)
        }
    }
