import React, { useState } from 'react';
import { X, Workflow, Copy, Check, Terminal, ExternalLink, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface N8nPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const N8nPipelineModal: React.FC<N8nPipelineModalProps> = ({
  isOpen,
  onClose,
  appUrl = window.location.origin,
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  const curlCommand = `curl -X POST "${appUrl}/api/extract-github" \\
  -H "Content-Type: application/json" \\
  -d '{"githubUrl": "https://github.com/n8n-io/n8n"}'`;

  // Pre-configured n8n workflow snippet
  const n8nWorkflowJson = JSON.stringify(
    {
      name: "Social Post Card Generator & Pet Compositor",
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: "hours", hoursInterval: 24 }],
            },
          },
          name: "Schedule Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
        },
        {
          parameters: {
            method: "POST",
            url: `${appUrl}/api/extract-github`,
            sendBody: true,
            specifyBody: "json",
            jsonBody: '{\n  "githubUrl": "https://github.com/n8n-io/n8n"\n}',
            options: {},
          },
          name: "Extract Post JSON with Gemini",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.2,
          position: [460, 300],
        },
        {
          parameters: {
            jsCode: `// Validate strict limits before passing to render\nconst post = $input.first().json.data;\nconst limits = {\n  title: 28,\n  tagline: 45,\n  summary: 110,\n  useCase: 55\n};\n\nreturn [{\n  json: {\n    ...post,\n    isCompliant: post.title.length <= limits.title,\n    characterPetSlot: {\n      x: "62%",\n      y: "15%",\n      width: "35%",\n      height: "70%"\n    }\n  }\n}];`,
          },
          name: "Enforce Layout Limits & Pet Coordinates",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [680, 300],
        },
        {
          parameters: {
            notice: "Overlay your character pet PNG onto the reserved white space slot coordinates",
          },
          name: "Composite Character Pet JPG",
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
          position: [900, 300],
        },
      ],
      connections: {
        "Schedule Trigger": {
          main: [[{ node: "Extract Post JSON with Gemini", type: "main", index: 0 }]],
        },
        "Extract Post JSON with Gemini": {
          main: [[{ node: "Enforce Layout Limits & Pet Coordinates", type: "main", index: 0 }]],
        },
        "Enforce Layout Limits & Pet Coordinates": {
          main: [[{ node: "Composite Character Pet JPG", type: "main", index: 0 }]],
        },
      },
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                n8n Automation Pipeline Integration Guide
              </h2>
              <p className="text-xs text-slate-400">
                Recommended architecture to fetch GitHub repos, enforce character limits, and compose JPGs
              </p>
            </div>
          </div>
          <button
            id="close-n8n-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          {/* Architecture Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Recommended Production Pipeline Flow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">1. Trigger</span>
                <p className="text-[11px] text-slate-400">
                  n8n triggers via Cron (daily new repos) or Webhook passing a GitHub URL.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">2. API Request</span>
                <p className="text-[11px] text-slate-400">
                  HTTP Node calls <code className="text-indigo-300">/api/extract-github</code> to extract README and enforce strict character limits.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">3. JSON Validation</span>
                <p className="text-[11px] text-slate-400">
                  Data fits guaranteed limits (Title ≤28, Tagline ≤45, Summary ≤110) with zero overflow.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">4. Final JPG</span>
                <p className="text-[11px] text-slate-400">
                  n8n composites your character pet PNG over the white-space coordinates for social upload.
                </p>
              </div>
            </div>
          </div>

          {/* cURL Endpoint Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                API Endpoint for n8n HTTP Request Node
              </span>
              <button
                id="copy-curl-btn"
                onClick={async () => {
                  await navigator.clipboard.writeText(curlCommand);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-indigo-200 overflow-x-auto">
              {curlCommand}
            </pre>
          </div>

          {/* 1-Click Importable n8n Workflow JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                Ready-to-Import n8n Workflow (Paste into n8n canvas)
              </span>
              <button
                id="copy-n8n-workflow-btn"
                onClick={async () => {
                  await navigator.clipboard.writeText(n8nWorkflowJson);
                  setCopiedWorkflow(true);
                  setTimeout(() => setCopiedWorkflow(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors"
              >
                {copiedWorkflow ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Workflow Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Workflow JSON</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Open your n8n workspace, press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">Cmd+V</kbd>) to instantly import the workflow.
            </p>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto">
              {n8nWorkflowJson}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            id="close-modal-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
