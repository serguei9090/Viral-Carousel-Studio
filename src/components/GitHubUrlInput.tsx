import React, { useState } from 'react';
import { Github, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { PostCardData } from '../types';

interface GitHubUrlInputProps {
  onDataLoaded: (data: PostCardData, sourceInfo?: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const GitHubUrlInput: React.FC<GitHubUrlInputProps> = ({
  onDataLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [url, setUrl] = useState('https://github.com/n8n-io/n8n');
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const quickRepos = [
    { label: 'n8n', url: 'https://github.com/n8n-io/n8n' },
    { label: 'Superfile CLI', url: 'https://github.com/yorukot/superfile' },
    { label: 'Shadcn UI', url: 'https://github.com/shadcn/ui' },
    { label: 'FastAPI', url: 'https://github.com/fastapi/fastapi' },
  ];

  const handleExtract = async (targetUrl = url) => {
    if (!targetUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep('Connecting to GitHub & reading README.md...');

    try {
      const response = await fetch('/api/extract-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: targetUrl }),
      });

      setLoadingStep('Gemini AI analyzing use cases & enforcing character limits...');

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Failed to extract repository info.');
      }

      onDataLoaded(result.data, result.sourceRepo);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze repository. Check URL or try another repo.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Github className="w-4 h-4 text-indigo-400" />
            GitHub README & Use Case Extractor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gemini reads the README.md, extracts app title & key use cases, and fits strict limits
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50 self-start sm:self-auto">
          POST /api/extract-github
        </span>
      </div>

      {/* Input box */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Github className="w-4 h-4" />
          </div>
          <input
            id="github-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleExtract()}
            placeholder="https://github.com/owner/repository"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
          />
        </div>
        <button
          id="extract-github-btn"
          onClick={() => handleExtract()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing README...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Extract & Generate</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </>
          )}
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
        <span className="text-slate-400 font-medium">Quick Test Repos:</span>
        {quickRepos.map((repo) => (
          <button
            key={repo.url}
            id={`preset-repo-${repo.label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => {
              setUrl(repo.url);
              handleExtract(repo.url);
            }}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-[11px]"
          >
            {repo.label}
          </button>
        ))}
      </div>

      {/* Progress or Error states */}
      {isLoading && loadingStep && (
        <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 p-2.5 rounded-xl">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 flex-shrink-0" />
          <span>{loadingStep}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-rose-200">Extraction Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
