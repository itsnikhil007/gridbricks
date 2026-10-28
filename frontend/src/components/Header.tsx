import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Compass, 
  BarChart3, 
  Presentation, 
  Code2, 
  RefreshCw, 
  Clock,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
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
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Institutional Brand Mark */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-zinc-900 flex items-center justify-center shadow-xs">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm text-zinc-950 tracking-tight">
                  Gridbricks
                </span>
                <span className="hidden xs:inline text-[11px] font-medium text-zinc-400">
                  // UK Power Desk
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 hidden sm:block leading-tight">
                Day-Ahead Renewable Procurement & Settlement
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Segmented Tab Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'decision'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden lg:inline">Day-Ahead Dispatch Desk</span>
              <span className="lg:hidden">Dispatch Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'accuracy'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">Accuracy & Backtest Lab</span>
              <span className="lg:hidden">Accuracy Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden lg:inline">Commercial Dossier</span>
              <span className="lg:hidden">Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'tech'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-700" />
              <span className="hidden lg:inline">System Architecture</span>
              <span className="lg:hidden">Tech Audit</span>
            </button>
          </nav>

          {/* Right Controls: Badges, Selectors, Sync */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Elexon Live Telemetry Badge (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Elexon BMRS Live</span>
            </div>

            {/* Gate Closure Countdown Badge (Large screens) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-amber-800">Gate:</span>
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-amber-950 font-semibold font-tabular focus:outline-none cursor-pointer"
              >
                <option value="08:00" className="bg-white text-zinc-900">08:00 GMT</option>
                <option value="09:30" className="bg-white text-zinc-900">09:30 GMT</option>
                <option value="11:00" className="bg-white text-zinc-900">11:00 GMT (EPEX DA)</option>
                <option value="14:00" className="bg-white text-zinc-900">14:00 GMT</option>
                <option value="17:00" className="bg-white text-zinc-900">17:00 GMT</option>
              </select>
              <span className="text-[11px] font-tabular text-amber-800 font-medium">({countdown})</span>
            </div>

            {/* Date Selector (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 font-medium shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-900 font-medium focus:outline-none cursor-pointer text-xs"
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
              className="p-1.5 sm:p-2 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-950 shadow-xs transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Mobile Controls Toggle Button (Screens < md) */}
            <button
              onClick={() => setShowMobileControls(!showMobileControls)}
              className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 text-zinc-700 text-xs font-medium cursor-pointer"
              title="Toggle mobile controls"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[11px]">Controls</span>
              {showMobileControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Strip (Screens < md) */}
        <div className="md:hidden border-t border-zinc-100 py-2">
          <nav className="grid grid-cols-4 gap-1 text-[11px] font-medium text-center">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-md transition cursor-pointer ${
                activeTab === 'decision'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-md transition cursor-pointer ${
                activeTab === 'accuracy'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Accuracy</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-md transition cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 shrink-0" />
              <span>Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('tech')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-md transition cursor-pointer ${
                activeTab === 'tech'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 shrink-0" />
              <span>Tech</span>
            </button>
          </nav>
        </div>

        {/* Mobile Expandable Controls Bar (Date, Gate Closure & Status) */}
        {showMobileControls && (
          <div className="md:hidden border-t border-zinc-200 py-3 bg-zinc-50/80 -mx-3 px-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Decision Date:</span>
              </span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs font-semibold text-zinc-900 shadow-2xs"
              >
                {dates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date}>
                    {d.decision_date} (Del: {d.delivery_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Gate Closure:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs font-semibold text-amber-950 shadow-2xs"
                >
                  <option value="08:00">08:00 GMT</option>
                  <option value="09:30">09:30 GMT</option>
                  <option value="11:00">11:00 GMT (EPEX DA)</option>
                  <option value="14:00">14:00 GMT</option>
                  <option value="17:00">17:00 GMT</option>
                </select>
                <span className="text-[10px] font-tabular text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {countdown}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500 border-t border-zinc-200/60">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="text-emerald-800 font-medium">Elexon BMRS Ingestion Live</span>
              </div>
              <span className="text-zinc-400">January 2026</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
