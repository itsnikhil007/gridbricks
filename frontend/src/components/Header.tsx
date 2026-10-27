import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'decision' | 'accuracy' | 'bmrs';
  setActiveTab: (tab: 'decision' | 'accuracy' | 'bmrs') => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenDossier: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cutoffTime,
  setCutoffTime,
  onSync,
  isSyncing,
  onOpenDossier
}) => {
  // Gate Closure countdown timer state (counting down to next 11:00 GMT)
  const [countdown, setCountdown] = useState<string>('01h 14m 22s');
  const [gridFreq, setGridFreq] = useState<number>(50.018);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate target cutoff today at 11:00 GMT (or tomorrow if already past 11:00)
      const target = new Date();
      target.setUTCHours(11, 0, 0, 0);
      if (now.getTime() > target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      const diffMs = target.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdown(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
      // Subtle oscillation for realistic 50Hz grid frequency telemetry
      setGridFreq(50.0 + (Math.sin(now.getTime() / 3000) * 0.024));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#080B10] border-b border-[#1A2234] select-none">
      {/* 1. 32px Top Streaming Telemetry Ribbon */}
      <div className="h-8 bg-[#0A0E17] border-b border-[#121824] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#00D2FF] animate-pulse" />
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">GB Wind Gen:</span>
            <span className="text-[#00D2FF] font-semibold tabular-nums">14,285 MW</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">DA EPEX Index:</span>
            <span className="text-white font-semibold tabular-nums">£78.20/MWh</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">NIV (Net Short):</span>
            <span className="text-[#EF4444] font-semibold tabular-nums">+420 MW</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Sys Freq:</span>
            <span className="text-[#10B981] font-semibold tabular-nums">
              {gridFreq.toFixed(3)} Hz
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping ml-0.5" />
          </div>
        </div>

        {/* Live Gate Closure Countdown */}
        <div className="flex items-center gap-2">
          <span className="text-[#FF9F1C] flex items-center gap-1.5 font-semibold bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 px-2 py-0.5 rounded-xs text-[10px]">
            <Clock className="w-3 h-3 text-[#FF9F1C]" />
            <span className="uppercase tracking-wider">GATE CLOSURE 11:00 GMT:</span>
            <span className="tabular-nums font-bold text-white">{countdown}</span>
          </span>
        </div>
      </div>

      {/* 2. Main Terminal Navigation Bar */}
      <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Market Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0E131F] border border-[#1A2234] flex items-center justify-center text-[#00D2FF] rounded-xs shadow-inner">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-tight text-white uppercase">
                Gridbricks
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#1A2234] text-slate-300 border border-slate-700">
                UK POWER TERMINAL
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
              EPEX SPOT DA / NORD POOL GB // DAY-AHEAD DISPATCH & RISK DESK
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-[#0E131F] border border-[#1A2234] rounded-xs p-0.5 font-mono text-xs">
          <button
            onClick={() => setActiveTab('decision')}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-xs ${
              activeTab === 'decision'
                ? 'bg-[#151C2C] text-[#00D2FF] font-semibold border-b-2 border-b-[#00D2FF]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2C]/50'
            }`}
          >
            <span className="text-slate-500 font-bold">[1]</span>
            <span>DISPATCH WORKBENCH</span>
          </button>

          <button
            onClick={() => setActiveTab('accuracy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-xs ${
              activeTab === 'accuracy'
                ? 'bg-[#151C2C] text-[#00D2FF] font-semibold border-b-2 border-b-[#00D2FF]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2C]/50'
            }`}
          >
            <span className="text-slate-500 font-bold">[2]</span>
            <span>MODEL RISK LAB</span>
          </button>

          <button
            onClick={() => setActiveTab('bmrs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-xs ${
              activeTab === 'bmrs'
                ? 'bg-[#151C2C] text-[#00D2FF] font-semibold border-b-2 border-b-[#00D2FF]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2C]/50'
            }`}
          >
            <span className="text-slate-500 font-bold">[3]</span>
            <span>BMRS TELEMETRY</span>
          </button>
        </nav>

        {/* Right Action Controls: Gate Closure Cutoff, Intel Dossier Trigger, Refresh */}
        <div className="flex items-center gap-2">
          {/* Gate Closure Cutoff Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0E131F] border border-[#1A2234] px-2 py-1 text-[11px] font-mono rounded-xs">
            <SlidersHorizontal className="w-3 h-3 text-[#00D2FF]" />
            <span className="text-slate-400">CUTOFF:</span>
            <select
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="bg-[#0A0E17] text-[#00D2FF] font-mono font-medium text-[11px] px-1 py-0.5 rounded-xs border border-[#1A2234] focus:outline-none cursor-pointer"
            >
              <option value="08:00">08:00 GMT</option>
              <option value="09:30">09:30 GMT</option>
              <option value="11:00">11:00 GMT (EPEX DA)</option>
              <option value="14:00">14:00 GMT</option>
              <option value="17:00">17:00 GMT</option>
            </select>
          </div>

          {/* Sync Refresh Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Verify against Elexon BMRS SQLite Cache"
            className="p-1.5 rounded-xs bg-[#0E131F] hover:bg-[#151C2C] border border-[#1A2234] text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00D2FF]' : ''}`} />
          </button>

          {/* Institutional Dossier Slide-Over Trigger */}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#1A2234] hover:bg-[#25324d] border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition shadow-sm hover:border-cyan-400"
            title="Press [D] or click to view Executive Pitch & Technical Review Dossier"
          >
            <FileText className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>[F1: INTEL & AUDIT DOSSIER]</span>
          </button>

          {/* BMRS Status Micro Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-xs bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[10px] font-mono font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>JAN 2026 VERIFIED</span>
          </div>
        </div>
      </div>
    </header>
  );
};
