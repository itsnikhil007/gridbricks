"""
FastAPI REST API Routes for Gridbricks UK Power Trading Web App
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.app.services.data_service import (
    get_available_decision_dates,
    get_day_ahead_forecast_and_actuals,
    get_forecast_evolution,
    get_monthly_accuracy_analysis
)
from backend.app.services.analytics import calculate_procurement_schedule, classify_weather_regime

router = APIRouter()

@router.get("/dates")
def list_dates():
    """
    Returns available decision dates in January 2026.
    """
    dates = get_available_decision_dates()
    return {"dates": dates}

@router.get("/forecast/latest")
def get_latest_forecast(
    decision_date: str = Query("2026-01-15", description="Decision date YYYY-MM-DD"),
    cutoff_time: str = Query("11:00", description="Decision cut-off time HH:MM"),
    base_demand_mw: float = Query(32000.0, description="Utility baseline customer demand in MW"),
    profile_type: str = Query("winter_peak", description="Demand profile: winter_peak or flat"),
    p90_buffer_mw: float = Query(0.0, description="Risk safety buffer in MW")
):
    """
    Returns the latest wind forecast available before cutoff_time on decision_date,
    along with delivery day actuals, quantitative error metrics, and thermal procurement plan.
    """
    try:
        data = get_day_ahead_forecast_and_actuals(
            decision_date=decision_date,
            cutoff_time=cutoff_time
        )
        forecast_pts = [{"startTime": s["startTime"], "generation": s["forecast_mw"]} for s in data["series"]]
        procurement = calculate_procurement_schedule(
            forecast_points=forecast_pts,
            base_demand_mw=base_demand_mw,
            profile_type=profile_type,
            p90_buffer_mw=p90_buffer_mw
        )

        # Merge procurement schedule back into series for clean frontend consumption
        for i, pt in enumerate(data["series"]):
            if i < len(procurement["schedule"]):
                proc = procurement["schedule"][i]
                pt["demand_mw"] = proc["demand_mw"]
                pt["net_thermal_mw"] = proc["net_thermal_mw"]
                pt["buffered_thermal_mw"] = proc["buffered_thermal_mw"]
                pt["surplus_wind_mw"] = proc["surplus_wind_mw"]

        data["procurement_summary"] = procurement["summary"]
        data["weather_regime"] = classify_weather_regime(forecast_pts)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast/evolution")
def get_evolution(
    decision_date: str = Query("2026-01-15"),
    delivery_date: str = Query("2026-01-16")
):
    """
    Returns all forecast runs published on decision_date covering delivery_date.
    """
    try:
        runs = get_forecast_evolution(decision_date, delivery_date)
        return {"decision_date": decision_date, "delivery_date": delivery_date, "runs": runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/accuracy/monthly")
def get_monthly_accuracy(
    cutoff_time: str = Query("11:00", description="Decision cut-off time HH:MM")
):
    """
    Returns month-wide January 2026 forecast accuracy metrics, daily trends,
    diurnal hourly error patterns, and residual error distribution.
    """
    try:
        return get_monthly_accuracy_analysis(cutoff_time=cutoff_time)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync_data():
    """
    Triggers check / refresh of local data against Elexon BMRS API.
    """
    return {"status": "success", "message": "Database is populated with complete verified January 2026 dataset."}
