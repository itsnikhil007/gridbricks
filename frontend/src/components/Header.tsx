import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Compass, 
  BarChart3, 
  Presentation, 
  Code2, 
  RefreshCw, 
  Clock,
  Calendar
} from 'lucide-react';
import type { DecisionDateOption } from '../types';

interface HeaderProps {
  activeTab: 'decision' | 'accuracy' | 'pitch' | 'tech';
  setActiveTab: (tab: 'decision' | 'accuracy' | 'pitch' | 'tech') => void;
  dates: DecisionDateOption[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dates,
  selectedDate,
  setSelectedDate,
  cutoffTime,
  setCutoffTime,
  onSync,
  isSyncing
}) => {
  // Live countdown timer to 11:00 GMT Gate Closure
  const [countdown, setCountdown] = useState<string>('01h 14m 22s');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(11, 0, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff < 0) diff += 24 * 3600 * 1000;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">Gridbricks</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  UK Energy Planner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Day-Ahead Wholesale Renewable Procurement
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'decision'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Day-Ahead Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'accuracy'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Accuracy & Trust Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'pitch'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Client Pitch</span>
            </button>

            <button
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'tech'
                  ? 'bg-purple-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Tech Review</span>
            </button>
          </nav>

          {/* Right Controls: Date Selector, Gate Closure, Sync */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Date Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {dates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date} className="bg-slate-900 text-slate-200">
                    Decision: {d.decision_date} (Delivery: {d.delivery_date})
                  </option>
                ))}
              </select>
            </div>

            {/* Gate Closure Countdown Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Gate Closure:</span>
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-amber-300 font-mono font-medium focus:outline-none cursor-pointer mr-1"
              >
                <option value="08:00" className="bg-slate-900 text-slate-200">08:00 GMT</option>
                <option value="09:30" className="bg-slate-900 text-slate-200">09:30 GMT</option>
                <option value="11:00" className="bg-slate-900 text-slate-200">11:00 GMT (EPEX DA)</option>
                <option value="14:00" className="bg-slate-900 text-slate-200">14:00 GMT</option>
                <option value="17:00" className="bg-slate-900 text-slate-200">17:00 GMT</option>
              </select>
              <span className="text-[11px] font-mono text-slate-400">({countdown})</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Refresh / Verify against Elexon BMRS API"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
