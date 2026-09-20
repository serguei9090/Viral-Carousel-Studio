import React from 'react';
import { Sparkles, FileJson, Workflow, Github, Terminal, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenN8nModal: () => void;
  onOpenCliModal: () => void;
  activeTab: 'generator' | 'json';
  setActiveTab: (tab: 'generator' | 'json') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenN8nModal,
  onOpenCliModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Viral Carousel Studio
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 hidden sm:inline">
                TikTok &bull; IG &bull; CLI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Generate 5-repo viral carousel slides with character mascot windows &amp; n8n CLI export
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
          <button
            id="tab-visual-editor-btn"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Carousel Studio
          </button>
          <button
            id="tab-json-editor-btn"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            JSON &amp; Pipeline
          </button>
        </div>

        {/* Right: CLI Guide & n8n Pipeline Guide Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="open-cli-guide-btn"
            onClick={onOpenCliModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>CLI Commands</span>
          </button>

          <button
            id="open-n8n-guide-btn"
            onClick={onOpenN8nModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">n8n Workflow</span>
          </button>
        </div>
      </div>
    </header>
  );
};
