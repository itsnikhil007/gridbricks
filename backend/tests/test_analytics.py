"""
Unit tests for analytics statistical functions and procurement calculator
"""

import pytest
from backend.app.services.analytics import calculate_kpis, calculate_procurement_schedule, get_hourly_load_multipliers

def test_calculate_kpis_perfect_forecast():
    actuals = [100.0, 200.0, 300.0, 400.0]
    forecasts = [100.0, 200.0, 300.0, 400.0]
    kpis = calculate_kpis(actuals, forecasts)

    assert kpis["count"] == 4
    assert kpis["mae"] == 0.0
    assert kpis["rmse"] == 0.0
    assert kpis["wape"] == 0.0
    assert kpis["mean_bias"] == 0.0
    assert kpis["r_squared"] == 1.0

def test_calculate_kpis_constant_offset():
    # Forecast systematically 50 MW higher than actuals
    actuals = [1000.0, 2000.0, 3000.0, 4000.0]
    forecasts = [1050.0, 2050.0, 3050.0, 4050.0]
    kpis = calculate_kpis(actuals, forecasts)

    assert kpis["count"] == 4
    assert kpis["mae"] == 50.0
    assert kpis["rmse"] == 50.0
    assert kpis["mean_bias"] == 50.0
    # WAPE = (200 / 10000) * 100 = 2.0%
    assert kpis["wape"] == 2.0

def test_calculate_kpis_empty_arrays():
    kpis = calculate_kpis([], [])
    assert kpis["count"] == 0
    assert kpis["mae"] == 0.0
    assert kpis["r_squared"] == 0.0

def test_procurement_schedule():
    forecast_points = [
        {"startTime": f"2026-01-02T{h:02d}:00:00Z", "generation": 10000.0}
        for h in range(24)
    ]
    res = calculate_procurement_schedule(
        forecast_points=forecast_points,
        base_demand_mw=30000.0,
        profile_type="flat",
        p90_buffer_mw=500.0
    )
    schedule = res["schedule"]
    summary = res["summary"]

    assert len(schedule) == 24
    # With flat demand 30,000 MW and wind 10,000 MW, net thermal = 20,000 MW
    assert schedule[0]["net_thermal_mw"] == 20000.0
    # With buffer 500 MW, buffered thermal = 20,500 MW
    assert schedule[0]["buffered_thermal_mw"] == 20500.0
    assert summary["total_demand_mwh"] == 30000.0 * 24
    assert summary["total_thermal_procured_mwh"] == 20000.0 * 24
