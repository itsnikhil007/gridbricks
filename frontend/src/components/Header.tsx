import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  Clock,
  Calendar,
  ChevronRight
} from 'lucide-react';
import type { DecisionDateOption } from '../types';

interface HeaderProps {
  activeTab: 'decision' | 'accuracy' | 'pitch' | 'tech';
  dates: DecisionDateOption[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  dates,
  selectedDate,
  setSelectedDate,
  cutoffTime,
  setCutoffTime,
  onSync,
  isSyncing,
  onOpenMobileSidebar
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'decision': return 'Day-Ahead Dispatch Desk';
      case 'accuracy': return 'Accuracy & Backtest Lab';
      case 'pitch': return 'Commercial Dossier';
      case 'tech': return 'System Architecture';
      default: return 'Dispatch Desk';
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs w-full max-w-full">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Toggle + Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-md hover:bg-zinc-100 text-zinc-700 transition cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0">
              <span className="font-semibold text-zinc-900 hidden xs:inline">Gridbricks</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 hidden xs:inline" />
              <span className="font-bold text-zinc-900 truncate">{getTabTitle()}</span>
              <span className="text-zinc-300 hidden md:inline">•</span>
              <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-sm font-medium hidden md:inline shrink-0">
                January 2026 Elexon BMRS
              </span>
            </nav>
          </div>

          {/* Right Controls: Date Selector, Gate Closure, Sync Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Gate Closure Cutoff Selector */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium shadow-2xs shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden sm:inline text-amber-800">Gate:</span>
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-amber-950 font-semibold font-tabular focus:outline-none cursor-pointer text-xs"
                title="Select Gate Closure Cutoff"
              >
                <option value="08:00" className="bg-white text-zinc-900">08:00 GMT</option>
                <option value="09:30" className="bg-white text-zinc-900">09:30 GMT</option>
                <option value="11:00" className="bg-white text-zinc-900">11:00 GMT (EPEX DA)</option>
                <option value="14:00" className="bg-white text-zinc-900">14:00 GMT</option>
                <option value="17:00" className="bg-white text-zinc-900">17:00 GMT</option>
              </select>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-md px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs text-zinc-800 font-medium shadow-2xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-900 font-semibold focus:outline-none cursor-pointer text-xs max-w-[130px] sm:max-w-none truncate"
                title="Select Delivery Date"
              >
                {dates.map((d) => {
                  const delivDay = d.delivery_date.split('-')[2] || d.delivery_date;
                  const decDay = d.decision_date.split('-')[2] || d.decision_date;
                  return (
                    <option key={d.decision_date} value={d.decision_date} className="bg-white text-zinc-900">
                      Deliv: {delivDay} Jan 2026 (Auction: {decDay} Jan)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Verify against Elexon BMRS API"
              className="p-1.5 sm:p-2 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-950 shadow-2xs transition disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
