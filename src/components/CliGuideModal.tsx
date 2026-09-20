import React, { useState } from 'react';
import { Terminal, Copy, Check, X, Sparkles, Folder, Play } from 'lucide-react';

interface CliGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CliGuideModal: React.FC<CliGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commands = [
    {
      title: '1. Generate from Multiple Repositories (up to 5):',
      cmd: `npm run cli -- --repos "MadsLorentzen/ai-job-search,wonderwhy-er/DesktopCommanderMCP,iOfficeAI/OfficeCLI,Nutlope/hallmark,diegosouzapw/OmniRoute" --theme editorial-cream --out ./output`,
      desc: 'Fetches metadata, generates viral hooks with Gemini AI, outputs cover slide, all repo slides, install slide, and carousel.json',
    },
    {
      title: '2. Generate from existing carousel.json (for n8n Automation):',
      cmd: `npm run cli -- --json ./carousel.json --theme dark-neo --out ./output`,
      desc: 'Loads your n8n workflow output directly and generates presentation slides',
    },
    {
      title: '3. Generate Curated Trending Repos Preset:',
      cmd: `npm run cli -- --preset trending --theme editorial-cream`,
      desc: 'Instantly builds Willy Westside TikTok replica slides in ./carousel-output',
    },
    {
      title: '4. View all CLI flags & help:',
      cmd: `npm run cli -- --help`,
      desc: 'Inspect theme options, topic customizers, and output directory flags',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CLI Automation & Headless Generator</h3>
              <p className="text-[11px] text-slate-400">Run from terminal or n8n Execute Command node</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {commands.map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>{item.title}</span>
                <button
                  onClick={() => copyCommand(item.cmd, idx)}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#111113] p-2.5 rounded-xl text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                {item.cmd}
              </pre>
              <p className="text-slate-400 text-[11px]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>Output includes HTML/PNG-ready slides + full carousel.json metadata</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
