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
  // Live countdown timer to selected GMT Gate Closure
  const [countdown, setCountdown] = useState<string>('01h 14m 22s');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      const [h, m] = (cutoffTime || '11:00').split(':').map(Number);
      target.setUTCHours(h, m || 0, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff < 0) diff += 24 * 3600 * 1000;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [cutoffTime]);

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Institutional Brand Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-950 tracking-tight">
                  Gridbricks // UK Power Desk
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Day-Ahead Renewable Procurement & Settlement
              </p>
            </div>
          </div>

          {/* Segmented Tab Navigation */}
          <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'decision'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Day-Ahead Dispatch Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'accuracy'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Accuracy & Backtest Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'pitch'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Commercial Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'tech'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>System Architecture</span>
            </button>
          </nav>

          {/* Right Controls: Badges, Date Selector, Sync */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Elexon Live Telemetry Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Elexon BMRS Live</span>
            </div>

            {/* Gate Closure Countdown Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-amber-800">Gate Closure:</span>
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-amber-950 font-semibold font-tabular focus:outline-none cursor-pointer mr-1"
              >
                <option value="08:00" className="bg-white text-zinc-900">08:00 GMT</option>
                <option value="09:30" className="bg-white text-zinc-900">09:30 GMT</option>
                <option value="11:00" className="bg-white text-zinc-900">11:00 GMT (EPEX DA)</option>
                <option value="14:00" className="bg-white text-zinc-900">14:00 GMT</option>
                <option value="17:00" className="bg-white text-zinc-900">17:00 GMT</option>
              </select>
              <span className="text-[11px] font-tabular text-amber-800">({countdown})</span>
            </div>

            {/* Date Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 font-medium shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-900 font-medium focus:outline-none cursor-pointer"
              >
                {dates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date} className="bg-white text-zinc-900">
                    Decision: {d.decision_date} (Delivery: {d.delivery_date})
                  </option>
                ))}
              </select>
            </div>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Refresh / Verify against Elexon BMRS API"
              className="p-2 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-950 shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
