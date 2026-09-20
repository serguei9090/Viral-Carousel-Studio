import React, { useRef, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Github,
  Star,
  CheckCircle2,
  Maximize2,
  Smartphone,
  Monitor,
  Square,
  HelpCircle,
  Eye,
  Sliders,
  Cat,
  Bot,
  Dog,
  Layers,
  Upload,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { PostCardData, STRICT_LIMITS, AspectRatio, PetCharacterConfig } from '../types';

interface PostCardPreviewProps {
  data: PostCardData;
  setData: React.Dispatch<React.SetStateAction<PostCardData>>;
  petConfig: PetCharacterConfig;
  setPetConfig: React.Dispatch<React.SetStateAction<PetCharacterConfig>>;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
}

export const PostCardPreview: React.FC<PostCardPreviewProps> = ({
  data,
  setData,
  petConfig,
  setPetConfig,
  aspectRatio,
  setAspectRatio,
  activeTheme,
  setActiveTheme,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [customFileLoading, setCustomFileLoading] = useState(false);

  // Themes palette definitions
  const themeStyles: Record<string, { bg: string; text: string; accent: string; cardBorder: string; badge: string; pill: string }> = {
    'dark-neo': {
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80',
      text: 'text-white',
      accent: 'text-indigo-400',
      cardBorder: 'border-slate-800 shadow-2xl shadow-indigo-950/40',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      pill: 'bg-slate-800/90 text-slate-200 border-slate-700/60',
    },
    'cyber-slate': {
      bg: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-cyan-950/60',
      text: 'text-white',
      accent: 'text-cyan-400',
      cardBorder: 'border-zinc-800 shadow-2xl shadow-cyan-950/30',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      pill: 'bg-zinc-800/90 text-zinc-200 border-zinc-700/60',
    },
    'sunset-glow': {
      bg: 'bg-gradient-to-br from-slate-950 via-stone-900 to-rose-950/70',
      text: 'text-white',
      accent: 'text-rose-400',
      cardBorder: 'border-stone-800 shadow-2xl shadow-rose-950/30',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      pill: 'bg-stone-800/90 text-stone-200 border-stone-700/60',
    },
    'emerald-minimal': {
      bg: 'bg-gradient-to-br from-neutral-950 via-slate-900 to-emerald-950/60',
      text: 'text-white',
      accent: 'text-emerald-400',
      cardBorder: 'border-emerald-900/40 shadow-2xl shadow-emerald-950/30',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      pill: 'bg-slate-800/90 text-slate-200 border-slate-700/60',
    },
    'pure-light': {
      bg: 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/50',
      text: 'text-slate-900',
      accent: 'text-indigo-600',
      cardBorder: 'border-slate-300/80 shadow-2xl shadow-slate-300/50',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      pill: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const currentTheme = themeStyles[activeTheme] || themeStyles['dark-neo'];

  // Download high-resolution JPG
  const handleDownloadJpg = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily ensure guides don't render in final exported file if user wants pure white space
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 2x high resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const safeTitle = (data.title || 'post-card').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `${safeTitle}-${aspectRatio}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export JPG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy card image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2500);
        } catch {
          // Fallback if browser doesn't allow direct image clipboard
          handleDownloadJpg();
        }
      });
    } catch (err) {
      console.error('Failed to copy card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Custom pet image upload
  const handleCustomPetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPetConfig({
        ...petConfig,
        type: 'custom',
        customImageUrl: result,
      });
      setCustomFileLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Aspect ratio dimensions container styles
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'horizontal':
        return 'aspect-[16/9] w-full max-w-[850px]';
      case 'vertical':
        return 'aspect-[9/16] w-full max-w-[450px]';
      case 'square':
        return 'aspect-square w-full max-w-[650px]';
      default:
        return 'aspect-[16/9] w-full max-w-[850px]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Viewport Aspect Ratio & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        {/* Viewport Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            id="viewport-horizontal-btn"
            onClick={() => setAspectRatio('horizontal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              aspectRatio === 'horizontal'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Horizontal 16:9 for TikTok/Instagram Landscape & Carousel"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Horizontal (16:9)</span>
          </button>
          <button
            id="viewport-square-btn"
            onClick={() => setAspectRatio('square')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              aspectRatio === 'square'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Square 1:1 for Instagram Feed"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Square (1:1)</span>
          </button>
          <button
            id="viewport-vertical-btn"
            onClick={() => setAspectRatio('vertical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              aspectRatio === 'vertical'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vertical 9:16 for Stories & Reels"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Vertical (9:16)</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="copy-card-img-btn"
            onClick={handleCopyImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Copy snapshot to clipboard"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          <button
            id="download-jpg-btn"
            onClick={handleDownloadJpg}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating JPG...' : 'Download JPG'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 rounded-3xl border border-slate-800/80 shadow-inner overflow-hidden min-h-[460px]">
        {/* The Post Card Render Element */}
        <div
          ref={cardRef}
          id="social-post-card"
          className={`relative rounded-3xl border ${currentTheme.cardBorder} ${currentTheme.bg} ${currentTheme.text} transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between overflow-hidden select-none ${getAspectRatioClasses()}`}
        >
          {/* Subtle background glow aesthetic */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {aspectRatio === 'horizontal' ? (
            /* ================= HORIZONTAL 16:9 VIEWPORT (Requested Format) ================= */
            <div className="h-full flex flex-row items-stretch justify-between gap-6 relative z-10">
              {/* Left Column: Title, Short Tagline, Summary, Use Cases, Footer */}
              <div className="flex-1 flex flex-col justify-between pr-2 min-w-0">
                {/* Header: Category Badge + GitHub Stats */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentTheme.badge}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {data.category || 'Developer Tool'}
                    </span>
                  </div>

                  {data.githubStars && (
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentTheme.pill}`}
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{data.githubStars}</span>
                    </div>
                  )}
                </div>

                {/* Core Title & "What it is in short" */}
                <div className="space-y-1.5 my-auto py-2">
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight truncate drop-shadow-sm"
                    title={data.title}
                  >
                    {data.title || 'App Title'}
                  </h1>

                  <p
                    className={`text-sm sm:text-base font-semibold ${currentTheme.accent} truncate`}
                    title={data.tagline}
                  >
                    {data.tagline || 'Short descriptive tagline'}
                  </p>

                  <p
                    className={`text-xs sm:text-sm leading-snug line-clamp-2 pt-1 ${
                      activeTheme === 'pure-light' ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {data.summary || 'Concise explanation of the product value.'}
                  </p>
                </div>

                {/* Key Use Cases (2 bullet points) */}
                <div className="space-y-2 py-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Key Use Cases
                  </div>
                  <div className="space-y-1.5">
                    {(data.useCases || []).slice(0, 2).map((uc, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs sm:text-[13px] font-medium px-3 py-1.5 rounded-xl border ${currentTheme.pill}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{uc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Github className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[160px] sm:max-w-[220px]">
                      {data.authorOrOrg ? `${data.authorOrOrg}/${data.title}` : data.callToAction}
                    </span>
                  </div>

                  <span
                    className={`font-semibold px-3 py-1 rounded-lg text-[11px] border ${currentTheme.badge}`}
                  >
                    {data.callToAction || 'Star on GitHub'}
                  </span>
                </div>
              </div>

              {/* Right Column: Reserved Character Pet White Space Slot */}
              <div className="w-[38%] max-w-[280px] flex flex-col justify-center items-center relative">
                <div
                  id="pet-character-slot"
                  className={`w-full h-full min-h-[190px] rounded-2xl flex flex-col items-center justify-center p-3 relative transition-all ${
                    petConfig.type === 'blank-space'
                      ? 'bg-white text-slate-900 shadow-xl border-2 border-dashed border-indigo-300/80'
                      : petConfig.type === 'custom'
                      ? 'bg-slate-900/40 border border-slate-700/50'
                      : 'bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/30'
                  }`}
                >
                  {/* Visual Pet Character Content */}
                  {petConfig.type === 'blank-space' && (
                    <div className="text-center p-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto mb-2 text-slate-500">
                        <Cat className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-wider block text-slate-900">
                        Reserved Space
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        For Character Pet
                      </span>
                      {petConfig.showPlacementGuides && (
                        <div className="mt-2 text-[9px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          n8n Overlay Slot
                        </div>
                      )}
                    </div>
                  )}

                  {petConfig.type === 'robot' && (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-bounce duration-1000">
                        <Bot className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-indigo-300 mt-2">
                        ByteBot Pet
                      </span>
                    </div>
                  )}

                  {petConfig.type === 'cyber-cat' && (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Cat className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-purple-300 mt-2">
                        Neko Pet
                      </span>
                    </div>
                  )}

                  {petConfig.type === 'pixel-fox' && (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-600/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Dog className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-amber-300 mt-2">
                        Fox Pet
                      </span>
                    </div>
                  )}

                  {petConfig.type === 'custom' && petConfig.customImageUrl && (
                    <div className="flex flex-col items-center justify-center w-full h-full p-2">
                      <img
                        src={petConfig.customImageUrl}
                        alt="Character pet preview"
                        className="max-h-36 sm:max-h-44 object-contain filter drop-shadow-xl"
                      />
                    </div>
                  )}

                  {/* Dimension tag for n8n compositing guides */}
                  {petConfig.showPlacementGuides && (
                    <div className="absolute top-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-indigo-300 border border-indigo-500/30">
                      Pet Zone
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= SQUARE / VERTICAL VIEWPORT ================= */
            <div className="h-full flex flex-col justify-between relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentTheme.badge}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {data.category || 'Developer Tool'}
                </span>
                {data.githubStars && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentTheme.pill}`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{data.githubStars}</span>
                  </div>
                )}
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {data.title || 'App Title'}
                </h1>
                <p className={`text-sm sm:text-base font-semibold ${currentTheme.accent}`}>
                  {data.tagline || 'Short descriptive tagline'}
                </p>
                <p
                  className={`text-xs sm:text-sm leading-snug line-clamp-2 pt-1 ${
                    activeTheme === 'pure-light' ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {data.summary || 'Concise explanation of product value.'}
                </p>
              </div>

              {/* Character Pet Space in Center */}
              <div
                id="pet-character-slot-vertical"
                className={`w-full min-h-[140px] flex-1 rounded-2xl flex items-center justify-center p-4 relative ${
                  petConfig.type === 'blank-space'
                    ? 'bg-white text-slate-900 shadow-xl border-2 border-dashed border-indigo-300'
                    : 'bg-indigo-500/10 border border-indigo-500/30'
                }`}
              >
                {petConfig.type === 'blank-space' ? (
                  <div className="text-center">
                    <Cat className="w-8 h-8 mx-auto text-slate-500 mb-1" />
                    <span className="font-bold text-xs uppercase block text-slate-900">
                      Reserved Character Pet White Space
                    </span>
                  </div>
                ) : petConfig.type === 'custom' && petConfig.customImageUrl ? (
                  <img
                    src={petConfig.customImageUrl}
                    alt="Custom mascot"
                    className="max-h-36 object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <Bot className="w-12 h-12 text-indigo-400" />
                    <span className="font-bold text-sm text-indigo-300">Avatar Pet Mascot</span>
                  </div>
                )}
              </div>

              {/* Use Cases */}
              <div className="space-y-1.5">
                {(data.useCases || []).slice(0, 2).map((uc, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl border ${currentTheme.pill}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{uc}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs">
                <span className="font-mono text-[11px] text-slate-400">{data.callToAction}</span>
                <span className={`px-2.5 py-1 rounded-lg text-[11px] border ${currentTheme.badge}`}>
                  GitHub
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pet & Theme Customizer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs">
        {/* Character Pet Space Configuration */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Cat className="w-4 h-4 text-indigo-400" />
              Character Pet Slot Mode
            </span>
            <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 cursor-pointer">
              <input
                id="toggle-guides-checkbox"
                type="checkbox"
                checked={petConfig.showPlacementGuides}
                onChange={(e) =>
                  setPetConfig({ ...petConfig, showPlacementGuides: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Show Cutout Guides</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="pet-mode-blank-btn"
              onClick={() => setPetConfig({ ...petConfig, type: 'blank-space' })}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                petConfig.type === 'blank-space'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              White Space (n8n Overlay)
            </button>
            <button
              id="pet-mode-robot-btn"
              onClick={() => setPetConfig({ ...petConfig, type: 'robot' })}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                petConfig.type === 'robot'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ByteBot
            </button>
            <button
              id="pet-mode-cat-btn"
              onClick={() => setPetConfig({ ...petConfig, type: 'cyber-cat' })}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                petConfig.type === 'cyber-cat'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Cyber Cat
            </button>
            <label
              htmlFor="upload-custom-pet"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Test Avatar PNG</span>
              <input
                id="upload-custom-pet"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleCustomPetUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Visual Themes */}
        <div className="space-y-2.5">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            Color Theme
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'dark-neo', label: 'Dark Neo' },
              { id: 'cyber-slate', label: 'Cyber Cyan' },
              { id: 'sunset-glow', label: 'Sunset' },
              { id: 'emerald-minimal', label: 'Emerald' },
              { id: 'pure-light', label: 'Clean Light' },
            ].map((theme) => (
              <button
                key={theme.id}
                id={`theme-${theme.id}-btn`}
                onClick={() => setActiveTheme(theme.id)}
                className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                  activeTheme === theme.id
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
