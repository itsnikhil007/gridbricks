import React, { useState, useEffect } from 'react';
import { X, FileText, Presentation, Code2 } from 'lucide-react';
import { ExecutivePitch } from './ExecutivePitch';
import { TechReview } from './TechReview';

interface DossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDesk: () => void;
}

export const DossierDrawer: React.FC<DossierDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToDesk
}) => {
  const [dossierTab, setDossierTab] = useState<'pitch' | 'tech'>('pitch');

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-Over Drawer Container */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-4xl bg-[#080B10] border-l border-[#1A2234] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-[#0A0E17] border-b border-[#1A2234] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1A2234] border border-cyan-500/40 rounded-xs flex items-center justify-center text-[#00D2FF]">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white tracking-tight uppercase">
                  DESK INTEL & AUDIT DOSSIER
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30 rounded-xs">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                UK Day-Ahead Renewable Procurement Audit & Architecture Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              [Press ESC to close]
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-xs bg-[#1A2234] hover:bg-[#25324d] text-slate-300 hover:text-white transition"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dossier Navigation Sub-Tabs */}
        <div className="bg-[#0E131F] border-b border-[#1A2234] px-3 py-1 flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setDossierTab('pitch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors ${
              dossierTab === 'pitch'
                ? 'bg-[#151C2C] text-[#10B981] font-bold border-b-2 border-b-[#10B981]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>[1] EXECUTIVE BRIEFING (£1.4M P&L CASE)</span>
          </button>

          <button
            onClick={() => setDossierTab('tech')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors ${
              dossierTab === 'tech'
                ? 'bg-[#151C2C] text-[#8B5CF6] font-bold border-b-2 border-b-[#8B5CF6]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>[2] TECHNICAL ARCHITECTURE REVIEW</span>
          </button>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {dossierTab === 'pitch' && (
            <ExecutivePitch
              onNavigateToDesk={() => {
                onClose();
                onNavigateToDesk();
              }}
            />
          )}

          {dossierTab === 'tech' && (
            <TechReview />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="bg-[#0A0E17] border-t border-[#1A2234] p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span>GRIDBRICKS // UK POWER TERMINAL</span>
            <span>•</span>
            <span>EPEX SPOT UK DAY-AHEAD</span>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-[#1A2234] hover:bg-[#25324d] text-slate-300 rounded-xs text-[10px] font-mono transition"
          >
            CLOSE DOSSIER [ESC]
          </button>
        </div>
      </div>
    </>
  );
};
