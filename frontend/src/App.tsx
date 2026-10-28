import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-[#F9F9FB] text-zinc-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dates={dates}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        cutoffTime={cutoffTime}
        setCutoffTime={setCutoffTime}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-medium text-xs border border-zinc-800 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-800">Gridbricks // UK Power Desk</span>
            <span>•</span>
            <span>Official Elexon BMRS Datasets (FUELHH & WINDFOR)</span>
            <span>•</span>
            <span>January 2026 Scope</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-600">UK Day-Ahead Wholesale Power Market</span>
            <span>•</span>
            <span className="text-teal-700 font-mono font-medium">FastAPI + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
