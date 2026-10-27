"""
Elexon BMRS Data Ingestion & SQLite Seed Script
Fetches FUELHH (wind actuals) and WINDFOR (wind forecasts) for January 2026
and stores them in backend/app/data/gridbricks.db.
"""

import sqlite3
import urllib.request
import json
import os
import sys
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DATA_DIR, "gridbricks.db")
BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

def init_db(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS actual_wind (
            startTime TEXT PRIMARY KEY,
            publishTime TEXT,
            settlementDate TEXT,
            settlementPeriod INTEGER,
            generation REAL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS forecast_wind (
            publishTime TEXT,
            startTime TEXT,
            generation REAL,
            PRIMARY KEY (publishTime, startTime)
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_fc_start ON forecast_wind (startTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_fc_pub ON forecast_wind (publishTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_act_start ON actual_wind (startTime)")
    conn.commit()
    return conn

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gridbricks/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        if resp.status == 200:
            return json.loads(resp.read().decode("utf-8"))
    return []

def seed_actuals(conn, start_dt, end_dt):
    cur = conn.cursor()
    current = start_dt
    chunk_days = 3
    total_inserted = 0

    print(f"Fetching FUELHH (Actuals) from {start_dt.isoformat()} to {end_dt.isoformat()}...")
    while current < end_dt:
        chunk_end = min(current + timedelta(days=chunk_days), end_dt)
        url = f"{BASE_URL}/FUELHH/stream?publishDateTimeFrom={current.strftime('%Y-%m-%dT%H:%M:%SZ')}&publishDateTimeTo={chunk_end.strftime('%Y-%m-%dT%H:%M:%SZ')}"
        try:
            items = fetch_json(url)
            wind_items = [x for x in items if x.get("fuelType") == "WIND"]
            for item in wind_items:
                cur.execute("""
                    INSERT OR REPLACE INTO actual_wind (startTime, publishTime, settlementDate, settlementPeriod, generation)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    item.get("startTime"),
                    item.get("publishTime"),
                    item.get("settlementDate"),
                    item.get("settlementPeriod"),
                    float(item.get("generation", 0.0))
                ))
            conn.commit()
            total_inserted += len(wind_items)
            print(f"  FUELHH: {current.strftime('%Y-%m-%d')} to {chunk_end.strftime('%Y-%m-%d')} -> {len(wind_items)} wind records")
        except Exception as e:
            print(f"  Error fetching FUELHH chunk {current}: {e}")
        current = chunk_end

    print(f"Total actual wind records in DB: {total_inserted}")

def seed_forecasts(conn, start_dt, end_dt):
    cur = conn.cursor()
    current = start_dt
    chunk_days = 3
    total_inserted = 0

    print(f"Fetching WINDFOR (Forecasts) from {start_dt.isoformat()} to {end_dt.isoformat()}...")
    while current < end_dt:
        chunk_end = min(current + timedelta(days=chunk_days), end_dt)
        url = f"{BASE_URL}/WINDFOR/stream?publishDateTimeFrom={current.strftime('%Y-%m-%dT%H:%M:%SZ')}&publishDateTimeTo={chunk_end.strftime('%Y-%m-%dT%H:%M:%SZ')}"
        try:
            items = fetch_json(url)
            for item in items:
                cur.execute("""
                    INSERT OR REPLACE INTO forecast_wind (publishTime, startTime, generation)
                    VALUES (?, ?, ?)
                """, (
                    item.get("publishTime"),
                    item.get("startTime"),
                    float(item.get("generation", 0.0))
                ))
            conn.commit()
            total_inserted += len(items)
            print(f"  WINDFOR: {current.strftime('%Y-%m-%d')} to {chunk_end.strftime('%Y-%m-%d')} -> {len(items)} forecasts")
        except Exception as e:
            print(f"  Error fetching WINDFOR chunk {current}: {e}")
        current = chunk_end

    print(f"Total forecast records in DB: {total_inserted}")

def main():
    conn = init_db()
    # From 2025-12-31 to 2026-02-02 covers all decision days in Jan 2026 (Jan 1-31) and delivery days (Jan 2-Feb 1)
    start_dt = datetime(2025, 12, 31, 0, 0, 0)
    end_dt = datetime(2026, 2, 2, 0, 0, 0)

    seed_actuals(conn, start_dt, end_dt)
    seed_forecasts(conn, start_dt, end_dt)

    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM actual_wind")
    act_count = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM forecast_wind")
    fc_count = cur.fetchone()[0]
    print(f"\nFinal Database State: {act_count} actuals, {fc_count} forecasts in {DB_PATH}")
    conn.close()

if __name__ == "__main__":
    main()
