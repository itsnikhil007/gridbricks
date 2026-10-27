import React from 'react';
import { 
  Zap, 
  BarChart3, 
  Compass, 
  Presentation, 
  Code2, 
  RefreshCw, 
  CheckCircle2,
  Clock
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'decision' | 'accuracy' | 'pitch' | 'tech';
  setActiveTab: (tab: 'decision' | 'accuracy' | 'pitch' | 'tech') => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cutoffTime,
  setCutoffTime,
  onSync,
  isSyncing
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Gridbricks</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  UK Power Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Day-Ahead Renewable Procurement & Accuracy Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'decision'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Decision Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'accuracy'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Accuracy Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Client Pitch</span>
            </button>

            <button
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'tech'
                  ? 'bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Tech Lead Review</span>
            </button>
          </nav>

          {/* Right Controls: Gate Closure Cutoff & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Gate Closure:</span>
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-cyan-300 font-mono font-medium focus:outline-none cursor-pointer"
              >
                <option value="08:00" className="bg-slate-900 text-slate-200">08:00 GMT</option>
                <option value="09:30" className="bg-slate-900 text-slate-200">09:30 GMT</option>
                <option value="11:00" className="bg-slate-900 text-slate-200">11:00 GMT (EPEX DA)</option>
                <option value="14:00" className="bg-slate-900 text-slate-200">14:00 GMT</option>
                <option value="17:00" className="bg-slate-900 text-slate-200">17:00 GMT</option>
              </select>
            </div>

            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Refresh / Verify against Elexon BMRS API"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Jan 2026 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
