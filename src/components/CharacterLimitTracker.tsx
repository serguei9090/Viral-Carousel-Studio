import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Scissors, Sparkles, Check, RefreshCw } from 'lucide-react';
import { PostCardData, STRICT_LIMITS } from '../types';

interface CharacterLimitTrackerProps {
  data: PostCardData;
  setData: React.Dispatch<React.SetStateAction<PostCardData>>;
}

export const CharacterLimitTracker: React.FC<CharacterLimitTrackerProps> = ({
  data,
  setData,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineSuccess, setRefineSuccess] = useState(false);

  const getStatus = (current: number, max: number) => {
    if (current > max) return { color: 'text-rose-400', bar: 'bg-rose-500', isOver: true };
    if (current >= max * 0.85) return { color: 'text-amber-400', bar: 'bg-amber-500', isOver: false };
    return { color: 'text-emerald-400', bar: 'bg-emerald-500', isOver: false };
  };

  const titleLength = (data.title || '').length;
  const taglineLength = (data.tagline || '').length;
  const summaryLength = (data.summary || '').length;
  const categoryLength = (data.category || '').length;
  const ctaLength = (data.callToAction || '').length;
  const uc1Length = (data.useCases?.[0] || '').length;
  const uc2Length = (data.useCases?.[1] || '').length;

  const hasAnyOverLimit =
    titleLength > STRICT_LIMITS.title ||
    taglineLength > STRICT_LIMITS.tagline ||
    summaryLength > STRICT_LIMITS.summary ||
    categoryLength > STRICT_LIMITS.category ||
    ctaLength > STRICT_LIMITS.callToAction ||
    uc1Length > STRICT_LIMITS.useCaseItem ||
    uc2Length > STRICT_LIMITS.useCaseItem;

  // Auto-trim strictly
  const handleAutoTrim = () => {
    setData((prev) => ({
      ...prev,
      title: prev.title.slice(0, STRICT_LIMITS.title),
      tagline: prev.tagline.slice(0, STRICT_LIMITS.tagline),
      summary: prev.summary.slice(0, STRICT_LIMITS.summary),
      category: prev.category.slice(0, STRICT_LIMITS.category),
      callToAction: prev.callToAction.slice(0, STRICT_LIMITS.callToAction),
      useCases: (prev.useCases || []).map((uc) => uc.slice(0, STRICT_LIMITS.useCaseItem)),
    }));
  };

  // AI Refine to fit smoothly without raw cutoff
  const handleAiRefine = async () => {
    setIsRefining(true);
    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Refine and reword these texts so each one fits within strict character bounds smoothly without cutting mid-word:
Title: ${data.title}
Tagline: ${data.tagline}
Summary: ${data.summary}
Use Cases: ${(data.useCases || []).join(' | ')}`,
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setData(resJson.data);
        setRefineSuccess(true);
        setTimeout(() => setRefineSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to AI refine:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Strict Character Limit Enforcement</h2>
            {hasAnyOverLimit ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Exceeding Limit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Check className="w-3 h-3 text-emerald-400" />
                100% Fit for n8n & JPG
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Guarantees no text overflows or wraps unexpectedly in the final exported graphics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasAnyOverLimit && (
            <button
              id="auto-trim-limits-btn"
              onClick={handleAutoTrim}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Trim to Limits</span>
            </button>
          )}

          <button
            id="ai-refit-limits-btn"
            onClick={handleAiRefine}
            disabled={isRefining}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {isRefining ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : refineSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isRefining ? 'Refining...' : refineSuccess ? 'Refitted!' : 'AI Re-fit'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Editable Fields & Strict Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">App Title (Name)</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(titleLength, STRICT_LIMITS.title).color}`}>
              {titleLength} / {STRICT_LIMITS.title}
            </span>
          </div>
          <input
            id="field-edit-title"
            type="text"
            value={data.title || ''}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatus(titleLength, STRICT_LIMITS.title).bar}`}
              style={{ width: `${Math.min(100, (titleLength / STRICT_LIMITS.title) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Short Tagline (What it is in short)</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(taglineLength, STRICT_LIMITS.tagline).color}`}>
              {taglineLength} / {STRICT_LIMITS.tagline}
            </span>
          </div>
          <input
            id="field-edit-tagline"
            type="text"
            value={data.tagline || ''}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatus(taglineLength, STRICT_LIMITS.tagline).bar}`}
              style={{ width: `${Math.min(100, (taglineLength / STRICT_LIMITS.tagline) * 100)}%` }}
            />
          </div>
        </div>

        {/* Summary Description */}
        <div className="space-y-1 md:col-span-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Summary (Punchy Value Proposition)</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(summaryLength, STRICT_LIMITS.summary).color}`}>
              {summaryLength} / {STRICT_LIMITS.summary}
            </span>
          </div>
          <textarea
            id="field-edit-summary"
            rows={2}
            value={data.summary || ''}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatus(summaryLength, STRICT_LIMITS.summary).bar}`}
              style={{ width: `${Math.min(100, (summaryLength / STRICT_LIMITS.summary) * 100)}%` }}
            />
          </div>
        </div>

        {/* Use Case 1 */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Use Case 1</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(uc1Length, STRICT_LIMITS.useCaseItem).color}`}>
              {uc1Length} / {STRICT_LIMITS.useCaseItem}
            </span>
          </div>
          <input
            id="field-edit-usecase-1"
            type="text"
            value={data.useCases?.[0] || ''}
            onChange={(e) => {
              const ucs = [...(data.useCases || [])];
              ucs[0] = e.target.value;
              setData({ ...data, useCases: ucs });
            }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatus(uc1Length, STRICT_LIMITS.useCaseItem).bar}`}
              style={{ width: `${Math.min(100, (uc1Length / STRICT_LIMITS.useCaseItem) * 100)}%` }}
            />
          </div>
        </div>

        {/* Use Case 2 */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Use Case 2</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(uc2Length, STRICT_LIMITS.useCaseItem).color}`}>
              {uc2Length} / {STRICT_LIMITS.useCaseItem}
            </span>
          </div>
          <input
            id="field-edit-usecase-2"
            type="text"
            value={data.useCases?.[1] || ''}
            onChange={(e) => {
              const ucs = [...(data.useCases || [])];
              ucs[1] = e.target.value;
              setData({ ...data, useCases: ucs });
            }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatus(uc2Length, STRICT_LIMITS.useCaseItem).bar}`}
              style={{ width: `${Math.min(100, (uc2Length / STRICT_LIMITS.useCaseItem) * 100)}%` }}
            />
          </div>
        </div>

        {/* Category Badge */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Category Pill</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(categoryLength, STRICT_LIMITS.category).color}`}>
              {categoryLength} / {STRICT_LIMITS.category}
            </span>
          </div>
          <input
            id="field-edit-category"
            type="text"
            value={data.category || ''}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Call to Action */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Footer Call to Action / Link</span>
            <span className={`font-mono text-[11px] font-bold ${getStatus(ctaLength, STRICT_LIMITS.callToAction).color}`}>
              {ctaLength} / {STRICT_LIMITS.callToAction}
            </span>
          </div>
          <input
            id="field-edit-cta"
            type="text"
            value={data.callToAction || ''}
            onChange={(e) => setData({ ...data, callToAction: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
