import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DecisionDesk } from './components/DecisionDesk';
import { AccuracyLab } from './components/AccuracyLab';
import { ExecutivePitch } from './components/ExecutivePitch';
import { TechReview } from './components/TechReview';
import type { DecisionDateOption } from './types';
import { getDates, syncElexonData } from './services/api';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'decision' | 'accuracy' | 'pitch' | 'tech'>('decision');
  const [dates, setDates] = useState<DecisionDateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [cutoffTime, setCutoffTime] = useState<string>('11:00');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Sidebar Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  // Load available decision dates
  useEffect(() => {
    async function loadDates() {
      try {
        const availableDates = await getDates();
        setDates(availableDates);
        if (availableDates.length > 0) {
          const defaultDate = availableDates.find(d => d.decision_date === '2026-01-15') || availableDates[0];
          setSelectedDate(defaultDate.decision_date);
        }
      } catch (err) {
        console.error('Failed to load dates', err);
      }
    }
    loadDates();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncElexonData();
      setSyncToast(res.message);
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err: any) {
      setSyncToast(err.message || 'Sync failed');
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#F9F9FB] text-zinc-900 font-sans">
      
      {/* Enterprise Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        cutoffTime={cutoffTime}
        countdown={countdown}
      />

      {/* Main Application Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 max-w-full overflow-hidden">
        
        {/* Top Utility Header */}
        <Header
          activeTab={activeTab}
          dates={dates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          cutoffTime={cutoffTime}
          setCutoffTime={setCutoffTime}
          onSync={handleSync}
          isSyncing={isSyncing}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-zinc-900 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 font-medium text-xs border border-zinc-800 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Scrollable Main Content Workspace */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0 max-w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
            
            {activeTab === 'decision' && (
              <DecisionDesk
                dates={dates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                cutoffTime={cutoffTime}
              />
            )}

            {activeTab === 'accuracy' && (
              <AccuracyLab cutoffTime={cutoffTime} />
            )}

            {activeTab === 'pitch' && (
              <ExecutivePitch onNavigateToDesk={() => setActiveTab('decision')} />
            )}

            {activeTab === 'tech' && (
              <TechReview />
            )}

            {/* Clean Enterprise Footer */}
            <footer className="border border-zinc-200 bg-white py-4 px-5 rounded-xl text-xs text-zinc-500 w-full max-w-full overflow-hidden shadow-2xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="font-semibold text-zinc-800">Gridbricks // UK Power Desk</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="hidden sm:inline">Official Elexon BMRS Datasets (FUELHH & WINDFOR)</span>
                  <span>•</span>
                  <span>January 2026 Scope</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-end">
                  <span className="text-zinc-600">UK Day-Ahead Wholesale Market</span>
                  <span>•</span>
                  <span className="text-teal-700 font-mono font-medium">FastAPI + React 19</span>
                </div>
              </div>
            </footer>

          </div>
        </main>
      </div>

    </div>
  );
}

export default App;
