import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionDesk } from './components/DecisionDesk';
import { AccuracyLab } from './components/AccuracyLab';
import { BmrsTape } from './components/BmrsTape';
import { DossierDrawer } from './components/DossierDrawer';
import type { DecisionDateOption } from './types';
import { getDates, syncElexonData } from './services/api';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'decision' | 'accuracy' | 'bmrs'>('decision');
  const [dates, setDates] = useState<DecisionDateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [cutoffTime, setCutoffTime] = useState<string>('11:00');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // Load available decision dates
  useEffect(() => {
    async function loadDates() {
      try {
        const availableDates = await getDates();
        setDates(availableDates);
        if (availableDates.length > 0) {
          // Default to mid-month Jan 15, 2026
          const defaultDate = availableDates.find(d => d.decision_date === '2026-01-15') || availableDates[0];
          setSelectedDate(defaultDate.decision_date);
        }
      } catch (err) {
        console.error('Failed to load dates', err);
      }
    }
    loadDates();
  }, []);

  // Global Keyboard Shortcuts: [1], [2], [3], [D], [F1]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept F1 universally to avoid triggering browser help
      if (e.key === 'F1') {
        e.preventDefault();
        setIsDossierOpen(prev => !prev);
        return;
      }

      // Ignore if active element is an input, textarea, or select
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT'
      );
      if (isInput) return;

      if (e.key === '1') {
        e.preventDefault();
        setIsDossierOpen(false);
        setActiveTab('decision');
      } else if (e.key === '2') {
        e.preventDefault();
        setIsDossierOpen(false);
        setActiveTab('accuracy');
      } else if (e.key === '3') {
        e.preventDefault();
        setIsDossierOpen(false);
        setActiveTab('bmrs');
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDossierOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="min-h-screen bg-[#080B10] text-slate-100 flex flex-col font-sans selection:bg-[#00D2FF] selection:text-black">
      {/* Institutional Terminal Header with Streaming Telemetry */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cutoffTime={cutoffTime}
        setCutoffTime={setCutoffTime}
        onSync={handleSync}
        isSyncing={isSyncing}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0E131F] border border-[#10B981] text-white px-3.5 py-2.5 rounded-xs shadow-2xl flex items-center gap-2 font-mono text-xs animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Full-Bleed Content Area */}
      <main className="flex-1 w-full px-2 sm:px-3 py-2.5">
        {activeTab === 'decision' && (
          <DecisionDesk
            dates={dates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            cutoffTime={cutoffTime}
            setCutoffTime={setCutoffTime}
          />
        )}

        {activeTab === 'accuracy' && (
          <AccuracyLab cutoffTime={cutoffTime} />
        )}

        {activeTab === 'bmrs' && (
          <BmrsTape />
        )}
      </main>

      {/* Slide-Over Dossier Drawer */}
      <DossierDrawer
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onNavigateToDesk={() => setActiveTab('decision')}
      />

      {/* Compact Terminal Footer */}
      <footer className="border-t border-[#1A2234] bg-[#0A0E17] py-2 px-3 text-[11px] font-mono text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">GRIDBRICKS // UK POWER DESK</span>
            <span>•</span>
            <span>Elexon BMRS Official FUELHH & WINDFOR Datasets</span>
            <span>•</span>
            <span className="text-[#10B981]">January 2026 Ingestion Verified</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-slate-400">EPEX SPOT Day-Ahead UK Wholesale Auction (11:00 GMT Gate Closure)</span>
            <span>•</span>
            <span className="text-slate-400">Shortcuts: <kbd className="px-1 py-0.2 bg-[#1A2234] text-[#00D2FF] rounded-xs">[1]</kbd> <kbd className="px-1 py-0.2 bg-[#1A2234] text-[#00D2FF] rounded-xs">[2]</kbd> <kbd className="px-1 py-0.2 bg-[#1A2234] text-[#00D2FF] rounded-xs">[3]</kbd> <kbd className="px-1 py-0.2 bg-[#1A2234] text-cyan-300 rounded-xs">[D]</kbd></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
