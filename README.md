# UK Day-Ahead Electricity Market Wind Forecast & Procurement Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-10%20Passed-emerald.svg)](https://docs.pytest.org/)

An end-to-end decision-support and forecast accuracy evaluation platform tailored for a UK electricity utility trading desk operating in the UK wholesale day-ahead power market.

---

## 🌐 Live Deployed Application & Repository
- **GitHub Repository:** [https://github.com/itsnikhil007/gridbricks](https://github.com/itsnikhil007/gridbricks)
- **Live Web App:** [https://gridbricks-power-desk.vercel.app](https://gridbricks-power-desk.vercel.app) *(or your deployed Vercel URL)*
- **API Documentation (Swagger UI):** `http://localhost:8000/docs` (when running locally)

---

## ⚡ Problem Setting & Market Context

In the Great Britain (GB) electricity wholesale market (EPEX SPOT / Nord Pool):
1. **Day-Ahead Gate Closure:** Power purchase orders for delivery day $D$ must be submitted on day $D-1$ before Gate Closure (strictly at **11:00 GMT**).
2. **Thermal Procurement Sizing:** Utilities must supply their consumers' demand by first utilizing available renewable generation (wind turbines) and then purchasing residual electricity from conventional/thermal power plants.
3. **Intermittency & Cash-out Risk:** Because wind is weather-dependent, trading desks must rely on day-ahead wind forecasts. If wind under-delivers, the utility is "short" and faces penal System Imbalance Cash-out charges (up to £300/MWh); if wind over-delivers, excess thermal energy was needlessly purchased.

This platform empowers energy trading and risk teams to:
- **Requirement 1:** Extract the latest wind generation forecast available at Gate Closure and calculate the exact net thermal procurement volume (MW and MWh).
- **Requirement 2:** Quantitatively evaluate the historical accuracy of wind forecasts (MAE, RMSE, WAPE, Mean Bias, $R^2$, and P10/P90 tail risk) to make risk-adjusted trading decisions.

---

## 📊 Data Scope (January 2026 Elexon BMRS)

The platform exclusively consumes official national-level UK electricity data from **Elexon BMRS** as mandated by the assignment guidelines:
- **Actual Generation (`FUELHH`):** Half-hourly actual generation stream filtered strictly for `fuelType == "WIND"`.
- **Forecast Generation (`WINDFOR`):** Multi-horizon wind forecasts published periodically at 1-hour resolution.
- **Time-Alignment Methodology:** To enable rigorous comparison with wholesale market standards, the two 30-minute settlement periods of each hour are arithmetically averaged ($\text{Actual}_H = \frac{\text{HH}_1 + \text{HH}_2}{2}$), converting average MW directly into MWh energy volumes.

---

## 🗂️ File and Directory Structure

```
gridbricks-1/
├── Dockerfile                  # Multi-stage production Dockerfile (Node.js + Python)
├── docker-compose.yml          # Single-command local startup
├── vercel.json                 # Vercel serverless deployment config
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git tracking exclusions
├── README.md                   # Complete project documentation
├── api/
│   └── index.py                # Serverless entrypoint for Vercel deployment
├── backend/
│   ├── requirements.txt        # Python dependencies (FastAPI, Uvicorn, NumPy, Pytest, etc.)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entrypoint, CORS, static SPA mounting
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── endpoints.py    # REST API endpoints (/dates, /forecast, /accuracy, /sync)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── analytics.py    # Statistical engine (MAE, RMSE, WAPE, Bias, R², P90, Regimes)
│   │   │   └── data_service.py # SQLite database access, time-alignment, and queries
│   │   └── data/
│   │       ├── seed_data.py    # Elexon BMRS data ingestion ETL script
│   │       └── elexon_jan2026.db # Pre-seeded SQLite DB (1,488 actuals, 19,272 forecasts)
│   └── tests/
│       ├── test_analytics.py   # Unit tests for mathematical formulations and edge cases
│       └── test_api.py         # Integration tests for FastAPI endpoints
├── frontend/
│   ├── package.json            # React 19, Vite, Tailwind CSS, Recharts, Lucide
│   ├── vite.config.ts          # Vite configuration with API proxy and Tailwind v4
│   ├── index.html              # HTML shell
│   └── src/
│       ├── main.tsx            # React application root
│       ├── App.tsx             # Main dashboard shell & responsive sidebar layout
│       ├── index.css           # Tailwind CSS styling and theme
│       ├── types/
│       │   └── index.ts        # TypeScript data contracts & interfaces
│       ├── services/
│       │   └── api.ts          # Frontend API client
│       └── components/
│           ├── Sidebar.tsx             # Collapsible left navigation & Gate Closure countdown
│           ├── Header.tsx              # Top utility bar (Gate cutoff, date selector, sync status)
│           ├── SmartDispatchWizard.tsx # 1-Click AI Copilot, persona chips & P90 posture toggle
│           ├── DecisionDesk.tsx        # Requirement 1: Day-Ahead forecast & procurement calculator
│           ├── AccuracyLab.tsx         # Requirement 2: Quantitative accuracy & error decomposition
│           ├── CommercialDossier.tsx   # Executive business case & avoided imbalance financial audit
│           └── SystemArchitecture.tsx  # System topology, database schema, and live test console
└── docs/
    └── video_script.md         # Timed word-for-word 10-minute video presentation script
```

---

## 🚀 How to Start the Application

### Option A: Using Docker (Recommended — 1 Command)
Ensure Docker is installed and running on your system:
```bash
docker-compose up
```
Once started, open your browser at **`http://localhost:8000`**. The container builds the React frontend and serves both the FastAPI API and the web UI.

To run with plain Docker:
```bash
docker build -t gridbricks-uk-power .
docker run -p 8000:8000 gridbricks-uk-power
```

---

### Option B: Local Development Setup

#### 1. Backend (Python 3.12+)
```bash
# Navigate to project root
pip install -r backend/requirements.txt

# Run backend tests
python -m pytest backend/tests/ -v

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

#### 2. Frontend (Node.js 20+)
In a separate terminal:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open **`http://localhost:5173`** in your browser. Requests to `/api` are automatically proxied to the Python backend on port 8000.

---

## 📐 Mathematical Formulation of Accuracy Metrics

| Metric | Formula | Purpose |
| :--- | :--- | :--- |
| **MAE** | $\frac{1}{N} \sum \|F_i - A_i\|$ | Average absolute volume deviation per hour (MW). |
| **RMSE** | $\sqrt{\frac{1}{N} \sum (F_i - A_i)^2}$ | Penalizes large forecasting misses heavily (key for balancing risk). |
| **WAPE** | $\frac{\sum \|F_i - A_i\|}{\sum A_i} \times 100\%$ | Normalized percentage error without division-by-zero artifacts. |
| **Mean Bias** | $\frac{1}{N} \sum (F_i - A_i)$ | Quantifies systematic over-prediction ($+$) or under-prediction ($-$). |
| **$R^2$** | $1 - \frac{\sum (A_i - F_i)^2}{\sum (A_i - \bar{A})^2}$ | Measures variance explained / tracking fidelity. |
| **P90 VaR** | $\text{Quantile}_{0.90}(F_i - A_i)$ | Non-parametric Value-at-Risk safety buffer to avoid cash-out penalties. |

---

## 🧪 Automated Testing

The backend includes a comprehensive pytest suite verifying mathematical calculations, edge-case resilience (zero wind, constant bias, empty arrays), regime classification, and API endpoint schemas:
```bash
python -m pytest backend/tests/ -v
```
**Result:** 10 tests passed in 1.24s.

---

## 🤖 Explicit AI Tools Disclosure

In accordance with the challenge guidelines:
- **AI Tools Used:** Google Antigravity / Gemini assisted in architecture design, data engineering pipelines, mathematical modeling, test suite creation, and UI component styling.
- All code, mathematical formulas, and Elexon BMRS ingestion endpoints have been verified against official UK electricity data specifications.

---

## 🎥 10-Minute Video Presentation Guide
A complete, word-for-word timed script is included in **[`docs/video_script.md`](docs/video_script.md)**:
- **Part 1 (Minutes 0:00 – 4:45):** Client Pitch (Commercial value, live walkthrough of Decision Desk & Accuracy Lab, £1.42M estimated imbalance penalty savings).
- **Part 2 (Minutes 4:45 – 9:45):** Tech Lead Review (FastAPI + SQLite architecture, Elexon streaming ETL, time alignment math, test suite, and Docker containerization).
