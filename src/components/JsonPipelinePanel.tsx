import React, { useState } from 'react';
import { CarouselData } from '../types';
import {
  FileJson,
  Upload,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Code2,
  Workflow,
  ExternalLink,
} from 'lucide-react';

interface JsonPipelinePanelProps {
  carousel: CarouselData;
  setCarousel: React.Dispatch<React.SetStateAction<CarouselData>>;
}

export const JsonPipelinePanel: React.FC<JsonPipelinePanelProps> = ({
  carousel,
  setCarousel,
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(carousel, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync internal json text when parent carousel changes
  React.useEffect(() => {
    setJsonText(JSON.stringify(carousel, null, 2));
  }, [carousel]);

  // Handle manual JSON edit
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (!parsed.repos || !Array.isArray(parsed.repos)) {
        throw new Error("JSON must have a 'repos' array");
      }
      setCarousel(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.repos || !Array.isArray(parsed.repos)) {
          throw new Error("JSON file must contain a 'repos' array");
        }
        setCarousel(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
        setJsonError(null);
        setSuccessNotice(`Successfully loaded "${file.name}"!`);
        setTimeout(() => setSuccessNotice(null), 3500);
      } catch (err: any) {
        setJsonError(`Invalid JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(carousel, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${carousel.id || 'github-carousel'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(carousel, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            JSON File Import & n8n Automation Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload JSON files from n8n or download the payload for CLI batch rendering
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* File Upload Input */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Copy Button */}
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          {/* Download JSON Button */}
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {jsonError && (
        <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>JSON Syntax Notice: {jsonError}</span>
        </div>
      )}

      {/* n8n Integration Guide Callout */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
        <div className="flex items-center justify-between text-indigo-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-indigo-400" />
            How to use with n8n workflow or CLI
          </span>
          <span className="text-[10px] font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-200">
            HTTP Node &bull; CLI &bull; Webhook
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          In your n8n workflow: (1) Fetch trending repos or GitHub RSS, (2) Pass through OpenAI or Gemini node with this exact JSON schema, (3) Post to this app&apos;s API or execute{' '}
          <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">
            npx tsx cli.ts --json carousel.json
          </code>{' '}
          to generate high-res PNGs and composite your mascot character robot onto the designated blank slot!
        </p>
      </div>

      {/* JSON Editor Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Live Schema Editor:</span>
          <span>{carousel.repos.length} Repos loaded</span>
        </div>
        <textarea
          rows={12}
          value={jsonText}
          onChange={handleJsonChange}
          spellCheck={false}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed selection:bg-indigo-600 selection:text-white"
        />
      </div>
    </div>
  );
};
