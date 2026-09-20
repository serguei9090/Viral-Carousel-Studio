import React, { useState } from 'react';
import { CarouselData, RepoSlideData } from '../types';
import { presetCarousels } from '../carouselData';
import {
  Github,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  Edit3,
  ChevronDown,
  ChevronUp,
  Settings,
  Layers,
  Wand2,
  Terminal,
} from 'lucide-react';

interface MultiRepoManagerProps {
  carousel: CarouselData;
  setCarousel: React.Dispatch<React.SetStateAction<CarouselData>>;
  setCurrentSlideIndex: (idx: number) => void;
}

export const MultiRepoManager: React.FC<MultiRepoManagerProps> = ({
  carousel,
  setCarousel,
  setCurrentSlideIndex,
}) => {
  const [extractingMap, setExtractingMap] = useState<Record<string, boolean>>({});
  const [isBatchExtracting, setIsBatchExtracting] = useState(false);
  const [expandedRepoId, setExpandedRepoId] = useState<string | null>(carousel.repos[0]?.id || null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Add new repository slot (up to maxRepos)
  const handleAddRepo = () => {
    if (carousel.repos.length >= carousel.settings.maxRepos) return;

    const newIndex = carousel.repos.length + 1;
    const newRepo: RepoSlideData = {
      id: `repo-${Date.now()}`,
      index: newIndex,
      repoName: `Repo ${newIndex}`,
      author: 'developer',
      fullRepo: 'developer/new-repo',
      headlineLead: 'Supercharge your workflow',
      headlineAccent: 'without complexity.',
      summary: 'Automate repetitive tasks with lightning fast developer workflows.',
      punchline: 'Runs in terminal with zero dependencies.',
      cardDescription: 'Open source utility for modern developers.',
      language: 'TypeScript',
      languageColor: '#3178C6',
      stars: '10.5k',
      forks: '1,200',
      badge: 'free',
      githubUrl: 'https://github.com/developer/new-repo',
      cloneCommand: 'git clone github.com/developer/new-repo',
      useCases: ['Fast setup in 1 line', 'Zero config required'],
    };

    setCarousel((prev) => ({
      ...prev,
      repos: [...prev.repos, newRepo],
    }));
    setExpandedRepoId(newRepo.id);
  };

  // Remove repository slot
  const handleRemoveRepo = (id: string) => {
    if (carousel.repos.length <= 1) return;
    setCarousel((prev) => ({
      ...prev,
      repos: prev.repos
        .filter((r) => r.id !== id)
        .map((r, idx) => ({ ...r, index: idx + 1 })),
    }));
  };

  // Update repository field
  const handleUpdateRepo = (id: string, updates: Partial<RepoSlideData>) => {
    setCarousel((prev) => ({
      ...prev,
      repos: prev.repos.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  // Extract single repository via Gemini backend
  const handleExtractRepo = async (repo: RepoSlideData) => {
    if (!repo.githubUrl) return;
    setExtractingMap((prev) => ({ ...prev, [repo.id]: true }));
    setStatusMessage(`Extracting insights for ${repo.githubUrl}...`);

    try {
      const response = await fetch('/api/extract-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: repo.githubUrl }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const d = resJson.data;
        const owner = resJson.sourceRepo?.owner || repo.author || 'author';
        const repoName = resJson.sourceRepo?.repo || repo.repoName || 'repo';

        // Parse viral headline parts if possible
        const words = (d.tagline || d.title || 'Supercharge your coding').split(' ');
        const midPoint = Math.max(1, Math.floor(words.length * 0.6));
        const lead = words.slice(0, midPoint).join(' ');
        const accent = words.slice(midPoint).join(' ');

        handleUpdateRepo(repo.id, {
          repoName: repoName,
          author: owner,
          fullRepo: `${owner}/${repoName}`,
          headlineLead: lead || 'Powerful tool for devs',
          headlineAccent: accent ? `${accent}.` : 'while you sleep.',
          summary: d.summary || repo.summary,
          punchline: d.useCases?.[0] || repo.punchline,
          cardDescription: d.tagline || repo.cardDescription,
          stars: d.githubStars || repo.stars,
          cloneCommand: `git clone github.com/${owner}/${repoName}`,
          githubUrl: d.githubUrl || repo.githubUrl,
        });

        setStatusMessage(`Successfully extracted ${owner}/${repoName}!`);
      } else {
        setStatusMessage(`Extraction note: ${resJson.error || 'Check GitHub URL format'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Failed to extract: ${err.message}`);
    } finally {
      setExtractingMap((prev) => ({ ...prev, [repo.id]: false }));
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Batch extract all repositories with Gemini
  const handleBatchExtractAll = async () => {
    setIsBatchExtracting(true);
    setStatusMessage('Starting AI analysis across all repositories...');

    for (let i = 0; i < carousel.repos.length; i++) {
      const r = carousel.repos[i];
      if (r.githubUrl) {
        await handleExtractRepo(r);
      }
    }

    setIsBatchExtracting(false);
    setStatusMessage('All repositories refreshed with Gemini!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header & Batch Extraction Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-400" />
            Manage Carousel Repositories (Up to {carousel.settings.maxRepos})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add 1 to {carousel.settings.maxRepos} GitHub repos, run Gemini AI extraction, or customize viral hooks
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Max Repos Setting Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Max Repos:</span>
            <select
              value={carousel.settings.maxRepos}
              onChange={(e) =>
                setCarousel((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, maxRepos: parseInt(e.target.value, 10) },
                }))
              }
              className="bg-transparent text-indigo-300 font-bold focus:outline-none"
            >
              <option value="3" className="bg-slate-900">3 Repos</option>
              <option value="4" className="bg-slate-900">4 Repos</option>
              <option value="5" className="bg-slate-900">5 Repos (Default)</option>
            </select>
          </div>

          {/* Batch Extract All Button */}
          <button
            id="batch-extract-btn"
            onClick={handleBatchExtractAll}
            disabled={isBatchExtracting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-900/40 transition-all disabled:opacity-50"
          >
            {isBatchExtracting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>Extract All with Gemini</span>
          </button>

          {/* Add Repo Button */}
          {carousel.repos.length < carousel.settings.maxRepos && (
            <button
              onClick={handleAddRepo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Repo</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Load Curated List:
        </span>
        {presetCarousels.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setCarousel(preset.data);
              setCurrentSlideIndex(0);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-[11px]"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Global Carousel Cover & End Page Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
        {/* First Page / Cover Slide Settings */}
        <div className="space-y-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            First Page / Cover Slide Hook
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">Cover Topic / Header</label>
              <input
                type="text"
                value={carousel.topic}
                onChange={(e) => setCarousel((prev) => ({ ...prev, topic: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Badge Label</label>
              <input
                type="text"
                value={carousel.editionBadge}
                onChange={(e) => setCarousel((prev) => ({ ...prev, editionBadge: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400">Viral Headline Lead & Accent</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="5 insane open-source tools"
                value={carousel.coverTitle}
                onChange={(e) => setCarousel((prev) => ({ ...prev, coverTitle: e.target.value }))}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs font-serif"
              />
              <input
                type="text"
                placeholder="you need to try."
                value={carousel.coverTitleAccent}
                onChange={(e) => setCarousel((prev) => ({ ...prev, coverTitleAccent: e.target.value }))}
                className="w-36 bg-slate-900 border border-slate-800 rounded-lg p-2 text-orange-400 text-xs font-serif italic"
              />
            </div>
          </div>
        </div>

        {/* End Page / Install Slide Settings */}
        <div className="space-y-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            End Page / Install & CTA Slide
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">Highlight Clone Repo</label>
              <input
                type="text"
                value={carousel.installSlide.cloneHighlightRepo}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, cloneHighlightRepo: e.target.value },
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">AI Prompt Instruction</label>
              <input
                type="text"
                value={carousel.installSlide.agentPromptText}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, agentPromptText: e.target.value },
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400">Save Call To Action</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={carousel.installSlide.ctaTextLead}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, ctaTextLead: e.target.value },
                  }))
                }
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs font-serif"
              />
              <input
                type="text"
                value={carousel.installSlide.ctaTextAccent}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, ctaTextAccent: e.target.value },
                  }))
                }
                className="w-36 bg-slate-900 border border-slate-800 rounded-lg p-2 text-orange-400 text-xs font-serif italic"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion List of Repository Items */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Individual Repos ({carousel.repos.length} of {carousel.settings.maxRepos}):
        </span>

        {carousel.repos.map((repo, idx) => {
          const isExpanded = expandedRepoId === repo.id;
          const isExtracting = extractingMap[repo.id];

          return (
            <div
              key={repo.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
            >
              {/* Accordion Row Header */}
              <div className="p-3.5 flex items-center justify-between gap-3 bg-slate-900/60 hover:bg-slate-900 cursor-pointer">
                <div
                  onClick={() => setExpandedRepoId(isExpanded ? null : repo.id)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white font-mono mr-2">
                      {repo.fullRepo}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      &mdash; {repo.headlineLead} {repo.headlineAccent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Jump to Slide Button */}
                  <button
                    onClick={() => setCurrentSlideIndex(idx + 1)}
                    title="View this slide in card viewport"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    View Slide
                  </button>

                  {/* Extract with Gemini Button */}
                  <button
                    onClick={() => handleExtractRepo(repo)}
                    disabled={isExtracting}
                    title="Extract with Gemini AI"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                    )}
                    <span className="hidden sm:inline">AI Refine</span>
                  </button>

                  {/* Remove Button */}
                  {carousel.repos.length > 1 && (
                    <button
                      onClick={() => handleRemoveRepo(repo.id)}
                      title="Remove repo"
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Toggle Accordion */}
                  <button
                    onClick={() => setExpandedRepoId(isExpanded ? null : repo.id)}
                    className="p-1 text-slate-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Accordion Body Editor */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs">
                  {/* Row 1: GitHub URL & Stars & Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1">
                        GitHub Repository URL
                      </label>
                      <input
                        type="text"
                        value={repo.githubUrl}
                        onChange={(e) =>
                          handleUpdateRepo(repo.id, {
                            githubUrl: e.target.value,
                            fullRepo: e.target.value.replace(/https?:\/\/github\.com\//, '').replace(/\/$/, ''),
                          })
                        }
                        placeholder="https://github.com/owner/repo"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Stars</label>
                        <input
                          type="text"
                          value={repo.stars}
                          onChange={(e) => handleUpdateRepo(repo.id, { stars: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Language</label>
                        <input
                          type="text"
                          value={repo.language}
                          onChange={(e) => handleUpdateRepo(repo.id, { language: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Viral Headline (Lead + Italic Accent) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Catchy Headline (Lead)
                      </label>
                      <input
                        type="text"
                        value={repo.headlineLead}
                        onChange={(e) =>
                          handleUpdateRepo(repo.id, { headlineLead: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-serif text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Highlighted Accent Words (Italic)
                      </label>
                      <input
                        type="text"
                        value={repo.headlineAccent}
                        onChange={(e) =>
                          handleUpdateRepo(repo.id, { headlineAccent: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-orange-400 font-serif italic text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 3: Summary and Punchline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Crisp Description Sentence
                      </label>
                      <textarea
                        rows={2}
                        value={repo.summary}
                        onChange={(e) => handleUpdateRepo(repo.id, { summary: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Bold Punchline
                      </label>
                      <textarea
                        rows={2}
                        value={repo.punchline}
                        onChange={(e) =>
                          handleUpdateRepo(repo.id, { punchline: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
