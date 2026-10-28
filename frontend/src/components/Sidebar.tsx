import React from 'react';
import { 
  Zap, Compass, BarChart3, Presentation, Code2, 
  Clock, PanelLeftClose, PanelLeft, Sparkles, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'decision' | 'accuracy' | 'pitch' | 'tech';
  setActiveTab: (tab: 'decision' | 'accuracy' | 'pitch' | 'tech') => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  cutoffTime: string;
  countdown: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  cutoffTime,
  countdown,
}) => {
  const navItems = [
    {
      id: 'decision',
      label: 'Dispatch Desk',
      sublabel: 'Day-Ahead Procurement',
      icon: Compass,
      badge: 'Live EPEX',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'accuracy',
      label: 'Accuracy Lab',
      sublabel: '744h Backtest Audit',
      icon: BarChart3,
      badge: 'MAE ±856',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'pitch',
      label: 'Commercial Dossier',
      sublabel: 'Client Pitch & ROI',
      icon: Presentation,
      badge: '£1.42M',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'tech',
      label: 'System Architecture',
      sublabel: 'FastAPI & Math Audit',
      icon: Code2,
      badge: '9/9 Tests',
      badgeColor: 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  ];

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 select-none">
      
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-xs shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-950 tracking-tight">Gridbricks</span>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1 rounded">GB</span>
              </div>
              <p className="text-[10px] text-zinc-500 truncate leading-none mt-0.5">UK Power Desk</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Close button (mobile) */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Telemetry Status Strip */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/60 shrink-0 space-y-2">
          {/* Elexon BMRS Live */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">BMRS Stream:</span>
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Online (FUELHH)</span>
            </div>
          </div>

          {/* Gate Closure Countdown */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Gate {cutoffTime}:</span>
            </span>
            <span className="text-[11px] font-tabular font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              {countdown}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Trading Workspaces
          </span>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition cursor-pointer group ${
                isActive
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-medium'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-900'
              }`} />

              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="block text-xs truncate leading-tight">{item.label}</span>
                    <span className={`block text-[10px] truncate leading-tight ${
                      isActive ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {item.sublabel}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    isActive 
                      ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
                      : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {/* 1-Click AI Assistant Banner Card (Expanded only) */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <div 
              onClick={() => handleSelectTab('decision')}
              className="p-3 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 cursor-pointer hover:shadow-xs transition"
            >
              <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>1-Click AI Dispatch</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-tight">
                Instant P90 risk sizing, thermal schedule & EPEX ticket download.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-100 shrink-0 text-center">
        {!isCollapsed ? (
          <div className="text-[10px] text-zinc-400 space-y-0.5">
            <div className="font-semibold text-zinc-600">Elexon January 2026 Scope</div>
            <div>FastAPI • React 19 • SQLite WAL</div>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title="Elexon Connected"></div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden lg:block shrink-0 transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
