"""
Integration tests for FastAPI endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_list_dates():
    response = client.get("/api/dates")
    assert response.status_code == 200
    data = response.json()
    assert "dates" in data
    assert len(data["dates"]) == 31
    assert data["dates"][0]["decision_date"] == "2026-01-01"

def test_get_latest_forecast():
    response = client.get("/api/forecast/latest?decision_date=2026-01-15&cutoff_time=11:00&base_demand_mw=30000")
    assert response.status_code == 200
    data = response.json()
    assert data["decision_date"] == "2026-01-15"
    assert data["delivery_date"] == "2026-01-16"
    assert "series" in data
    assert len(data["series"]) == 24
    assert "metrics" in data
    assert "mae" in data["metrics"]
    assert "procurement_summary" in data

def test_get_forecast_evolution():
    response = client.get("/api/forecast/evolution?decision_date=2026-01-15&delivery_date=2026-01-16")
    assert response.status_code == 200
    data = response.json()
    assert "runs" in data
    assert len(data["runs"]) > 0

def test_get_monthly_accuracy():
    response = client.get("/api/accuracy/monthly?cutoff_time=11:00")
    assert response.status_code == 200
    data = response.json()
    assert "overall_kpis" in data
    assert data["overall_kpis"]["count"] > 0
    assert "daily_breakdown" in data
    assert len(data["daily_breakdown"]) == 31
    assert "diurnal_profile" in data
    assert len(data["diurnal_profile"]) == 24
