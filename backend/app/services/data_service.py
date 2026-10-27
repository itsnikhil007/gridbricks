"""
Data Access and Analytics Query Service for Gridbricks Power App
Interacts with the SQLite database to extract day-ahead forecasts,
actual generation, time-align them, and calculate analytics.
"""

import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from backend.app.services.analytics import calculate_kpis, calculate_procurement_schedule

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "gridbricks.db")

def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_available_decision_dates() -> List[Dict[str, str]]:
    """
    Returns available decision dates in January 2026 and corresponding delivery dates.
    """
    dates = []
    start = datetime(2026, 1, 1)
    end = datetime(2026, 1, 31)
    cur = start
    while cur <= end:
        dec_str = cur.strftime("%Y-%m-%d")
        deliv_str = (cur + timedelta(days=1)).strftime("%Y-%m-%d")
        dates.append({
            "decision_date": dec_str,
            "delivery_date": deliv_str,
            "label": f"Decision: {dec_str} → Delivery: {deliv_str}"
        })
        cur += timedelta(days=1)
    return dates

def get_day_ahead_forecast_and_actuals(
    decision_date: str,
    cutoff_time: str = "11:00",
    resolution: str = "hourly"
) -> Dict[str, Any]:
    """
    Retrieves the latest available forecast published on or before `decision_date T cutoff_time`
    for delivery day D = decision_date + 1 day, along with actual generation.
    """
    conn = get_connection()
    cur = conn.cursor()

    dec_dt = datetime.strptime(decision_date, "%Y-%m-%d")
    deliv_dt = dec_dt + timedelta(days=1)
    deliv_date_str = deliv_dt.strftime("%Y-%m-%d")

    cutoff_dt_str = f"{decision_date}T{cutoff_time}:00Z"
    deliv_start_str = f"{deliv_date_str}T00:00:00Z"
    deliv_end_str = f"{deliv_date_str}T23:59:59Z"

    # Query latest forecast published on or before cutoff for delivery day
    query_fc = """
        SELECT f.startTime, f.publishTime, f.generation
        FROM forecast_wind f
        INNER JOIN (
            SELECT startTime, MAX(publishTime) as maxPub
            FROM forecast_wind
            WHERE publishTime <= ?
              AND startTime >= ?
              AND startTime <= ?
            GROUP BY startTime
        ) latest ON f.startTime = latest.startTime AND f.publishTime = latest.maxPub
        ORDER BY f.startTime ASC
    """
    cur.execute(query_fc, (cutoff_dt_str, deliv_start_str, deliv_end_str))
    fc_rows = cur.fetchall()

    # Query actual generation for delivery day
    query_act = """
        SELECT startTime, publishTime, settlementPeriod, generation
        FROM actual_wind
        WHERE startTime >= ? AND startTime <= ?
        ORDER BY startTime ASC
    """
    cur.execute(query_act, (deliv_start_str, deliv_end_str))
    act_rows = cur.fetchall()

    conn.close()

    # In WINDFOR, startTime is hourly: 00:00:00Z, 01:00:00Z, etc.
    # In FUELHH, startTime is half-hourly: 00:00:00Z, 00:30:00Z, 01:00:00Z, etc.
    # For wholesale market standard hourly comparison:
    # Average the two half-hours for each hour: (HH1 + HH2) / 2
    act_by_hour: Dict[str, List[float]] = {}
    act_raw_points = []
    for row in act_rows:
        st = row["startTime"]
        gen = float(row["generation"])
        act_raw_points.append({
            "startTime": st,
            "settlementPeriod": row["settlementPeriod"],
            "generation": gen
        })
        # Group by hour "YYYY-MM-DDTHH:00:00Z"
        hour_key = st[:13] + ":00:00Z"
        if hour_key not in act_by_hour:
            act_by_hour[hour_key] = []
        act_by_hour[hour_key].append(gen)

    hourly_series = []
    actuals_vector = []
    forecasts_vector = []
    latest_publish_run = None

    for row in fc_rows:
        st = row["startTime"]
        fc_gen = float(row["generation"])
        pub = row["publishTime"]
        if latest_publish_run is None or pub > latest_publish_run:
            latest_publish_run = pub

        # Get hourly average actual
        act_samples = act_by_hour.get(st, [])
        act_gen = round(sum(act_samples) / len(act_samples), 1) if act_samples else None

        item = {
            "startTime": st,
            "hour": int(st[11:13]),
            "publishTime": pub,
            "forecast_mw": fc_gen,
            "actual_mw": act_gen,
            "error_mw": round(fc_gen - act_gen, 1) if act_gen is not None else None,
            "abs_error_mw": round(abs(fc_gen - act_gen), 1) if act_gen is not None else None
        }
        hourly_series.append(item)

        if act_gen is not None:
            actuals_vector.append(act_gen)
            forecasts_vector.append(fc_gen)

    daily_kpis = calculate_kpis(actuals_vector, forecasts_vector)

    return {
        "decision_date": decision_date,
        "cutoff_time": cutoff_time,
        "delivery_date": deliv_date_str,
        "latest_publish_run": latest_publish_run,
        "series": hourly_series,
        "half_hourly_actuals": act_raw_points,
        "metrics": daily_kpis
    }

def get_forecast_evolution(decision_date: str, delivery_date: str) -> List[Dict[str, Any]]:
    """
    Returns multiple forecast runs published on day D-1 to visualize forecast evolution.
    """
    conn = get_connection()
    cur = conn.cursor()

    deliv_start_str = f"{delivery_date}T00:00:00Z"
    deliv_end_str = f"{delivery_date}T23:59:59Z"
    dec_start_str = f"{decision_date}T00:00:00Z"
    dec_end_str = f"{decision_date}T23:59:59Z"

    # Find distinct publish times on day D-1 that cover delivery day
    cur.execute("""
        SELECT DISTINCT publishTime
        FROM forecast_wind
        WHERE publishTime >= ? AND publishTime <= ?
          AND startTime >= ? AND startTime <= ?
        ORDER BY publishTime ASC
    """, (dec_start_str, dec_end_str, deliv_start_str, deliv_end_str))
    pub_times = [r["publishTime"] for r in cur.fetchall()]

    runs = []
    for pt in pub_times:
        cur.execute("""
            SELECT startTime, generation
            FROM forecast_wind
            WHERE publishTime = ?
              AND startTime >= ? AND startTime <= ?
            ORDER BY startTime ASC
        """, (pt, deliv_start_str, deliv_end_str))
        pts = cur.fetchall()
        runs.append({
            "publishTime": pt,
            "points": [{"startTime": p["startTime"], "generation": float(p["generation"])} for p in pts]
        })

    conn.close()
    return runs

def get_monthly_accuracy_analysis(cutoff_time: str = "11:00") -> Dict[str, Any]:
    """
    Evaluates forecast accuracy across all 31 decision days of January 2026.
    """
    decision_dates = get_available_decision_dates()
    daily_summaries = []
    all_actuals = []
    all_forecasts = []
    diurnal_buckets: Dict[int, Dict[str, List[float]]] = {h: {"actuals": [], "forecasts": []} for h in range(24)}
    all_residuals = []

    for d in decision_dates:
        res = get_day_ahead_forecast_and_actuals(d["decision_date"], cutoff_time=cutoff_time)
        metrics = res["metrics"]
        if metrics["count"] > 0:
            daily_summaries.append({
                "decision_date": d["decision_date"],
                "delivery_date": d["delivery_date"],
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "wape": metrics["wape"],
                "mean_bias": metrics["mean_bias"],
                "mean_actual": metrics["mean_actual"],
                "mean_forecast": metrics["mean_forecast"],
                "r_squared": metrics["r_squared"]
            })

            for s in res["series"]:
                if s["actual_mw"] is not None:
                    act = s["actual_mw"]
                    fc = s["forecast_mw"]
                    h = s["hour"]
                    all_actuals.append(act)
                    all_forecasts.append(fc)
                    all_residuals.append(fc - act)
                    diurnal_buckets[h]["actuals"].append(act)
                    diurnal_buckets[h]["forecasts"].append(fc)

    overall_kpis = calculate_kpis(all_actuals, all_forecasts)

    # Diurnal (hourly) breakdown
    diurnal_profile = []
    for h in range(24):
        acts = diurnal_buckets[h]["actuals"]
        fcs = diurnal_buckets[h]["forecasts"]
        kpi = calculate_kpis(acts, fcs)
        diurnal_profile.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "mean_actual": kpi["mean_actual"],
            "mean_forecast": kpi["mean_forecast"],
            "mae": kpi["mae"],
            "rmse": kpi["rmse"],
            "mean_bias": kpi["mean_bias"],
            "wape": kpi["wape"]
        })

    # Residuals histogram bins
    residuals_hist = []
    if all_residuals:
        min_e = min(all_residuals)
        max_e = max(all_residuals)
        num_bins = 20
        bin_width = (max_e - min_e) / num_bins if max_e > min_e else 100.0
        bins = [0] * num_bins
        for e in all_residuals:
            idx = min(int((e - min_e) / bin_width), num_bins - 1)
            bins[idx] += 1
        for i in range(num_bins):
            b_start = min_e + i * bin_width
            b_end = b_start + bin_width
            residuals_hist.append({
                "range_label": f"{int(b_start)} to {int(b_end)}",
                "bin_center": round((b_start + b_end) / 2, 1),
                "count": bins[i]
            })

    return {
        "cutoff_time": cutoff_time,
        "overall_kpis": overall_kpis,
        "daily_breakdown": daily_summaries,
        "diurnal_profile": diurnal_profile,
        "residuals_histogram": residuals_hist,
        "total_evaluated_hours": len(all_actuals)
    }
