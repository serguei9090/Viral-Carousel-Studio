import React, { useState, useEffect } from 'react';
import {
  FileJson,
  Upload,
  Download,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PostCardData } from '../types';

interface JsonEditorPanelProps {
  data: PostCardData;
  setData: React.Dispatch<React.SetStateAction<PostCardData>>;
}

export const JsonEditorPanel: React.FC<JsonEditorPanelProps> = ({ data, setData }) => {
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Sync state to json string whenever external data changes
  useEffect(() => {
    try {
      setJsonText(JSON.stringify(data, null, 2));
      setParseError(null);
    } catch (err) {
      // Ignore
    }
  }, [data]);

  // Handle user typing directly in the JSON editor
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);

    try {
      const parsed = JSON.parse(val);
      setData(parsed);
      setParseError(null);
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
    }
  };

  // Upload JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setData(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
        setParseError(null);
      } catch (err: any) {
        setParseError(`Failed to parse uploaded JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Drag and drop JSON file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          setData(parsed);
          setJsonText(JSON.stringify(parsed, null, 2));
          setParseError(null);
        } catch (err: any) {
          setParseError(`JSON parse error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download post.json file
  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(data.title || 'post').toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Validate post against strict limits via backend endpoint
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/validate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonText,
      });
      const resJson = await response.json();
      setValidationResult(resJson);
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Preset templates
  const presets = [
    {
      name: 'n8n Automation Post',
      data: {
        title: 'n8n Workflow Hub',
        tagline: 'Self-hosted AI Automation Engine',
        summary: 'Build autonomous AI agents and integrate over 400+ services with node-based logic.',
        useCases: [
          'Trigger webhooks and sync leads to CRM',
          'Deploy local Gemini and OpenAI pipelines',
        ],
        category: 'Automation Engine',
        callToAction: 'github.com/n8n-io/n8n',
        githubUrl: 'https://github.com/n8n-io/n8n',
        githubStars: '48.9k',
        theme: 'dark-neo',
      },
    },
    {
      name: 'Dev Tool (Superfile)',
      data: {
        title: 'Superfile CLI',
        tagline: 'Terminal File Manager for Devs',
        summary: 'Lightning-fast terminal file manager with syntax highlighting, dual-pane copy, and file previews.',
        useCases: [
          'Instant directory hopping with vim keys',
          'Batch renaming and clean visual dual panes',
        ],
        category: 'Terminal Utility',
        callToAction: 'yorukot/superfile',
        githubUrl: 'https://github.com/yorukot/superfile',
        githubStars: '14.2k',
        theme: 'cyber-slate',
      },
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-emerald-400" />
            JSON File Reader & Payload Sync
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Import, edit, or copy the exact JSON format consumed by n8n or static runners
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload Button */}
          <label
            htmlFor="json-file-input"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload .json</span>
            <input
              id="json-file-input"
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Validate Button */}
          <button
            id="validate-json-btn"
            onClick={handleValidate}
            disabled={isValidating || !!parseError}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isValidating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Validate Limits</span>
          </button>

          {/* Copy Button */}
          <button
            id="copy-json-btn"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            id="download-json-btn"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Load Template:</span>
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setData(preset.data);
              setJsonText(JSON.stringify(preset.data, null, 2));
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-[11px]"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* JSON Code Area with drag-and-drop support */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
      >
        <textarea
          id="raw-json-textarea"
          value={jsonText}
          onChange={handleJsonChange}
          rows={12}
          spellCheck={false}
          className="w-full bg-transparent text-xs font-mono text-indigo-200 focus:outline-none resize-y leading-relaxed"
          placeholder="Paste or edit post JSON here..."
        />
        <div className="text-[10px] text-slate-500 text-right select-none pt-1 border-t border-slate-800/60">
          Tip: You can drag & drop any .json file directly into this box
        </div>
      </div>

      {/* Parse Error Notification */}
      {parseError && (
        <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Validation Result Box */}
      {validationResult && (
        <div
          className={`p-3 rounded-xl border text-xs ${
            validationResult.isValid
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {validationResult.isValid ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>JSON Perfectly Validated & Ready for n8n Pipeline!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Strict Limit Warnings:</span>
              </>
            )}
          </div>
          {!validationResult.isValid && validationResult.errors && (
            <ul className="mt-1.5 space-y-1 list-disc list-inside text-[11px] text-amber-200">
              {Object.entries(validationResult.errors).map(([field, msg]: any) => (
                <li key={field}>
                  <strong>{field}</strong>: {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
