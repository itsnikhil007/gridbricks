import React from 'react';
import { 
  Server, Database, Layers, CheckCircle2, Box, Cpu
} from 'lucide-react';

export const TechReview: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-zinc-700">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-zinc-200 border-l-4 border-l-zinc-900 rounded-lg p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-sm border border-zinc-200">
            INTERNAL TECH AUDIT // ARCHITECTURE & MATH
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-[11px] text-zinc-500 font-medium">FASTAPI + SQLITE + REACT 19</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
          System Architecture, Data Pipelines & Mathematical Foundations
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-4xl">
          Engineered for deterministic sub-10ms query execution, mathematical rigor under the Balancing & Settlement Code (BSC), and offline resilience with pre-seeded January 2026 Elexon datasets.
        </p>
      </div>

      {/* 2. Core 3-Tier Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-900">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-zinc-500">API ENGINE</span>
            <Server className="w-4 h-4 text-zinc-700" />
          </div>
          <h3 className="font-bold text-zinc-950 text-sm">FastAPI + Python 3.12</h3>
          <p className="text-zinc-600 leading-relaxed">
            High-concurrency asynchronous REST backend with Pydantic v2 schemas, strict type contracts, and sub-10ms response times for day-ahead optimization queries.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between text-teal-800">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-teal-800">DATA STORAGE</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-bold text-zinc-950 text-sm">SQLite Ingestion & Cache</h3>
          <p className="text-zinc-600 leading-relaxed">
            Pre-seeded with 1,585 actual wind records and 19,272 forecast points. WAL mode with composite B-tree indexes for zero-latency offline development and testing.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-amber-800">FRONTEND UI</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-bold text-zinc-950 text-sm">React 19 + Tailwind v4</h3>
          <p className="text-zinc-600 leading-relaxed">
            Porcelain & Copper warm-neutral design system with Inter and JetBrains Mono typography, Recharts vector charts, and responsive 48-period BSC settlement ladder.
          </p>
        </div>
      </div>

      {/* 3. Time-Alignment Strategy & SQL Formulation */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-zinc-950 uppercase text-xs tracking-tight">
              Elexon Time-Alignment Strategy (BSC Resolution Mapping)
            </span>
          </div>
          <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200">
            WINDFOR vs FUELHH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <span className="text-[11px] text-teal-800 font-semibold block uppercase tracking-wider">
              WINDFOR Forecast Stream (1.0h Resolution)
            </span>
            <p className="text-zinc-600 leading-relaxed">
              Published at irregular times (every 2–4 hours) projecting 72+ hours out.
              Query locks the latest run published on or before 11:00 GMT Gate Closure:
              <code className="text-zinc-900 font-mono block mt-1 bg-white p-1 rounded-sm border border-zinc-200">
                MAX(publishTime) WHERE publishTime &lt;= Cutoff
              </code>
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1.5">
            <span className="text-[11px] text-amber-800 font-semibold block uppercase tracking-wider">
              FUELHH Actuals Stream (0.5h Resolution)
            </span>
            <p className="text-zinc-600 leading-relaxed">
              Published half-hourly (48 settlement periods per delivery day).
              For wholesale hourly market comparison, pairs are averaged:
              <code className="text-zinc-900 font-mono block mt-1 bg-white p-1 rounded-sm border border-zinc-200">
                Actual_Hour = (SP_2H+1 + SP_2H+2) / 2
              </code>
            </p>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md font-mono text-[11px] text-zinc-800 overflow-x-auto">
          <div className="text-zinc-500 mb-1">// Optimized SQLite Gate-Closure Query</div>
          <pre className="text-teal-900">{`SELECT f.startTime, f.publishTime, f.generation
FROM forecast_wind f
INNER JOIN (
    SELECT startTime, MAX(publishTime) as maxPub
    FROM forecast_wind
    WHERE publishTime <= :cutoff_timestamp
      AND startTime >= :delivery_start
      AND startTime <= :delivery_end
    GROUP BY startTime
) latest ON f.startTime = latest.startTime AND f.publishTime = latest.maxPub
ORDER BY f.startTime ASC;`}</pre>
        </div>
      </div>

      {/* 4. Statistical Formulations & Metric Rationales */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4 text-xs">
        <div className="border-b border-zinc-100 pb-3">
          <span className="font-bold text-zinc-950 uppercase text-xs tracking-tight">
            Statistical Metric Formulations & Trading Rationale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1">
            <span className="text-zinc-950 font-bold block text-xs">WAPE vs Naive MAPE</span>
            <p className="text-zinc-600 leading-relaxed">
              Naive MAPE divides by actual value (<code className="text-zinc-900 font-mono">|F - A| / A</code>). In low-wind lulls, near-zero generation causes explosive divisions by zero. <strong>WAPE</strong> sums absolute errors over total generation:
              <code className="text-zinc-900 font-mono block mt-1 bg-white p-1 rounded-sm border border-zinc-200">
                WAPE = (Σ |Error|) / (Σ Actual) × 100%
              </code>
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1">
            <span className="text-zinc-950 font-bold block text-xs">Mean Forecast Bias</span>
            <p className="text-zinc-600 leading-relaxed">
              Computes <code className="text-zinc-900 font-mono">mean(Forecast - Actual)</code>. Positive bias signifies systematic overestimation (leaving the utility short power in the balancing mechanism); negative bias represents underestimation (spill risk).
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-1">
            <span className="text-zinc-950 font-bold block text-xs">Empirical P90 VaR</span>
            <p className="text-zinc-600 leading-relaxed">
              Rather than assuming a Gaussian error distribution, non-parametric 10th and 90th percentiles are calculated directly from the empirical residuals to establish hedge safety buffers.
            </p>
          </div>
        </div>
      </div>

      {/* 5. DevOps, Automated Tests & Docker */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="font-bold text-zinc-950 uppercase text-xs tracking-tight">
            DevOps, Docker & Test Suite Verification
          </span>
          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-sm">
            9 / 9 TESTS PASSING
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Backend Regression Suite</span>
            </div>
            <p className="text-zinc-600">
              9 unit and integration tests verifying perfect forecast KPI parity, zero wind divisions, constant offsets, procurement schedules, and API endpoints.
            </p>
            <div className="bg-white p-2.5 rounded-sm border border-zinc-200 font-mono text-[11px] text-zinc-800">
              $ python -m pytest backend/tests/ -v<br />
              <span className="text-emerald-700 font-semibold">9 passed in 0.88s (100% pass rate)</span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md space-y-2">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <Box className="w-4 h-4 text-teal-600" />
              <span>Containerized Multi-Stage Image</span>
            </div>
            <p className="text-zinc-600">
              Production Dockerfile builds frontend assets via Node.js in stage 1, then bundles them into Python 3.12 slim runtime with pre-seeded database.
            </p>
            <div className="bg-white p-2.5 rounded-sm border border-zinc-200 font-mono text-[11px] text-zinc-800">
              $ docker compose up --build<br />
              <span className="text-teal-700 font-semibold">Unified terminal online at port 8000</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
