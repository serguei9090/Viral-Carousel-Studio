import React, { useRef, useState } from 'react';
import { CarouselData, PetCharacterConfig, AspectRatio } from '../types';
import { CoverSlideView } from './CoverSlideView';
import { RepoSlideView } from './RepoSlideView';
import { InstallSlideView } from './InstallSlideView';
import { THEME_STYLES } from '../themeStyles';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Archive,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';

interface CarouselViewportProps {
  carousel: CarouselData;
  setCarousel: React.Dispatch<React.SetStateAction<CarouselData>>;
  petConfig: PetCharacterConfig;
  setPetConfig: React.Dispatch<React.SetStateAction<PetCharacterConfig>>;
  currentSlideIndex: number;
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const CarouselViewport: React.FC<CarouselViewportProps> = ({
  carousel,
  setCarousel,
  petConfig,
  setPetConfig,
  currentSlideIndex,
  setCurrentSlideIndex,
}) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Total slides count: 1 (Cover) + repos count + 1 (Install)
  const totalSlides = 1 + carousel.repos.length + 1;

  // Aspect ratio dimensions
  const getAspectRatioClasses = (ar: AspectRatio) => {
    switch (ar) {
      case 'vertical-9-16':
        return 'w-[360px] sm:w-[410px] h-[640px] sm:h-[728px]';
      case 'portrait-4-5':
        return 'w-[380px] sm:w-[440px] h-[475px] sm:h-[550px]';
      case 'horizontal-16-9':
        return 'w-[520px] sm:w-[640px] h-[292px] sm:h-[360px]';
      case 'square-1-1':
      default:
        return 'w-[420px] sm:w-[500px] h-[420px] sm:h-[500px]';
    }
  };

  // Navigate slides
  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  // Export current slide as PNG
  const handleExportCurrentSlide = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(slideRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const slideName =
        currentSlideIndex === 0
          ? '01_cover_slide'
          : currentSlideIndex === totalSlides - 1
          ? `${String(totalSlides).padStart(2, '0')}_install_slide`
          : `${String(currentSlideIndex + 1).padStart(2, '0')}_${carousel.repos[currentSlideIndex - 1]?.repoName || 'repo'}`;

      const link = document.createElement('a');
      link.download = `${carousel.id}_${slideName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export slide:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy current slide to clipboard
  const handleCopySlide = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard?.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Export all slides as a single ZIP package
  const handleExportAllZip = async () => {
    setIsExporting(true);
    setExportProgress('Preparing slides...');
    const zip = new JSZip();

    try {
      const originalSlide = currentSlideIndex;

      for (let i = 0; i < totalSlides; i++) {
        setCurrentSlideIndex(i);
        setExportProgress(`Rendering slide ${i + 1} of ${totalSlides}...`);
        // Wait a frame for React to render
        await new Promise((r) => setTimeout(r, 220));

        if (slideRef.current) {
          const canvas = await html2canvas(slideRef.current, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: null,
            logging: false,
          });

          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

          const filename =
            i === 0
              ? '01_cover.png'
              : i === totalSlides - 1
              ? `${String(totalSlides).padStart(2, '0')}_install.png`
              : `${String(i + 1).padStart(2, '0')}_${carousel.repos[i - 1]?.repoName || 'repo'}.png`;

          zip.file(filename, base64Data, { base64: true });
        }
      }

      // Add carousel.json metadata file inside ZIP for n8n or CLI automation
      zip.file('carousel.json', JSON.stringify(carousel, null, 2));

      setExportProgress('Compressing ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${carousel.id || 'github-carousel'}_package.zip`;
      link.click();
      URL.revokeObjectURL(url);

      // Restore original slide
      setCurrentSlideIndex(originalSlide);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Top Toolbar: Aspect Ratio, Theme Picker, Config & Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            Ratio:
          </span>
          {(
            [
              { id: 'vertical-9-16', label: '9:16 (TikTok)' },
              { id: 'portrait-4-5', label: '4:5 (IG Post)' },
              { id: 'horizontal-16-9', label: '16:9 (Landscape)' },
              { id: 'square-1-1', label: '1:1 (Square)' },
            ] as const
          ).map((ratio) => (
            <button
              key={ratio.id}
              onClick={() =>
                setCarousel((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, aspectRatio: ratio.id },
                }))
              }
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                carousel.settings.aspectRatio === ratio.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        {/* Theme Picker */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Theme:
          </span>
          {Object.entries(THEME_STYLES).map(([key, style]) => {
            const shortLabel =
              key === 'designer-splash'
                ? 'Splash Orbs'
                : key === 'aurora-prism'
                ? 'Prism Light'
                : key === 'neon-cyberpunk'
                ? 'Neon'
                : key === 'luxury-gold'
                ? 'Gold'
                : key === 'tokyo-night'
                ? 'Tokyo'
                : key === 'nordic-frost'
                ? 'Nordic'
                : key === 'editorial-cream'
                ? 'Cream'
                : key === 'dark-neo'
                ? 'Dark Neo'
                : key === 'cyber-slate'
                ? 'Slate'
                : key === 'sunset-minimal'
                ? 'Sunset'
                : key === 'monochrome'
                ? 'Matrix'
                : style.name.split(' ')[0];

            return (
              <button
                key={key}
                onClick={() =>
                  setCarousel((prev) => ({
                    ...prev,
                    theme: key as any,
                    settings: {
                      ...prev.settings,
                      bgEffect: style.defaultBgEffect || prev.settings.bgEffect || 'none',
                    },
                  }))
                }
                title={style.name}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  carousel.theme === key
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: style.accentHex }}
                />
                <span className="text-[11px]">{shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Background Effect Picker (Designer Splash, Aurora, Spotlight, Grid, Flat) */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Background FX:
          </span>
          {(
            [
              { id: 'colorful-splash', label: '🎨 Splash' },
              { id: 'aurora-glow', label: '🌌 Aurora' },
              { id: 'studio-spotlight', label: '🎯 Spotlight' },
              { id: 'subtle-grid', label: '⊞ Grid' },
              { id: 'none', label: 'Flat' },
            ] as const
          ).map((fx) => {
            const currentThemeStyle = THEME_STYLES[carousel.theme];
            const currentEffect =
              carousel.settings.bgEffect !== undefined
                ? carousel.settings.bgEffect
                : currentThemeStyle?.defaultBgEffect || 'none';
            const active = currentEffect === fx.id;

            return (
              <button
                key={fx.id}
                onClick={() =>
                  setCarousel((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, bgEffect: fx.id },
                  }))
                }
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all ${
                  active
                    ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {fx.label}
              </button>
            );
          })}
        </div>

        {/* Button Shape & Size & CTA Editor */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2">CTA Shape:</span>
          {(
            [
              { id: 'pill-capsule', label: 'Capsule Pill' },
              { id: 'modern-squircle', label: 'Tech Squircle' },
              { id: 'stacked-full', label: 'Full-Width Stack' },
              { id: 'segmented-bar', label: 'Segmented Bar' },
            ] as const
          ).map((shape) => {
            const active =
              (carousel.installSlide.buttonStyle || carousel.settings.buttonStyle || 'pill-capsule') === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => {
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, buttonStyle: shape.id },
                    settings: { ...prev.settings, buttonStyle: shape.id },
                  }));
                  // Auto-switch to install slide so user sees the shape change immediately
                  setCurrentSlideIndex(totalSlides - 1);
                }}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {shape.label}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Button Size Idea Selector */}
          <span className="text-slate-400 font-medium px-1">Size:</span>
          {(
            [
              { id: 'compact', label: 'Compact' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'hero', label: 'Hero' },
            ] as const
          ).map((size) => {
            const active =
              (carousel.installSlide.buttonSize || carousel.settings.buttonSize || 'balanced') === size.id;
            return (
              <button
                key={size.id}
                onClick={() => {
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, buttonSize: size.id },
                    settings: { ...prev.settings, buttonSize: size.id },
                  }));
                  setCurrentSlideIndex(totalSlides - 1);
                }}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all ${
                  active
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {size.label}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Quick CTA Word Selection */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[10px] uppercase font-mono px-1">Words:</span>
            <button
              type="button"
              onClick={() => {
                setCarousel((prev) => ({
                  ...prev,
                  installSlide: { ...prev.installSlide, followButtonText: '+ FOLLOW', saveButtonText: 'SAVE THIS' },
                }));
                setCurrentSlideIndex(totalSlides - 1);
              }}
              title="Concise standard (+ FOLLOW / SAVE THIS)"
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            >
              + FOLLOW
            </button>
            <button
              type="button"
              onClick={() => {
                setCarousel((prev) => ({
                  ...prev,
                  installSlide: { ...prev.installSlide, followButtonText: 'FOLLOW', saveButtonText: 'SAVE' },
                }));
                setCurrentSlideIndex(totalSlides - 1);
              }}
              title="Minimalist (FOLLOW / SAVE)"
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            >
              FOLLOW
            </button>
            <button
              type="button"
              onClick={() => {
                setCarousel((prev) => ({
                  ...prev,
                  installSlide: {
                    ...prev.installSlide,
                    followButtonText: '+ FOLLOW FOR MORE',
                    saveButtonText: 'SAVE LIST',
                    buttonStyle: 'stacked-full',
                  },
                  settings: { ...prev.settings, buttonStyle: 'stacked-full' },
                }));
                setCurrentSlideIndex(totalSlides - 1);
              }}
              title="Long phrase with auto full-width stacked layout"
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-amber-300/90 border border-slate-800"
            >
              MORE (Stack)
            </button>
          </div>
        </div>

        {/* Action Buttons: Character Controls & Exports */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showConfigDrawer
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Character & Mascot</span>
          </button>

          <button
            id="copy-slide-btn"
            onClick={handleCopySlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            id="export-current-btn"
            onClick={handleExportCurrentSlide}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>

          <button
            id="export-zip-btn"
            onClick={handleExportAllZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
            <span>Export Full ZIP ({totalSlides})</span>
          </button>
        </div>
      </div>

      {/* Optional Mascot & Character Configuration Drawer */}
      {showConfigDrawer && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Mascot & Character Stage Window
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={petConfig.enabled}
                onChange={(e) =>
                  setPetConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-300">Enable Mascot Window</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Mascot Types */}
            <div>
              <span className="text-slate-400 block mb-1">Mascot Choice:</span>
              <select
                value={petConfig.type}
                onChange={(e) =>
                  setPetConfig((prev) => ({ ...prev, type: e.target.value as any }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="robot-magnifier">3D Robot with Magnifier (Screenshot 2)</option>
                <option value="robot-desk">3D Robot at Computer Desk (Screenshot 3)</option>
                <option value="blank-space">Reserved Blank Slot (for n8n Compositing)</option>
                <option value="custom">Custom Image / URL</option>
              </select>
            </div>

            {/* Custom URL */}
            {petConfig.type === 'custom' && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-1">Image URL or Data URI:</span>
                <input
                  type="text"
                  placeholder="https://... or uploaded png"
                  value={petConfig.customImageUrl || ''}
                  onChange={(e) =>
                    setPetConfig((prev) => ({ ...prev, customImageUrl: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px]"
                />
              </div>
            )}

            {/* Placement Guides Toggle */}
            <div>
              <span className="text-slate-400 block mb-1">Compositing Guides:</span>
              <button
                type="button"
                onClick={() =>
                  setPetConfig((prev) => ({
                    ...prev,
                    showPlacementGuides: !prev.showPlacementGuides,
                  }))
                }
                className={`w-full py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  petConfig.showPlacementGuides
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {petConfig.showPlacementGuides ? 'Guides Visible' : 'Guides Hidden'}
              </button>
            </div>

            {/* Mascot Scale Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Scale:</span>
                <span>{petConfig.scale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.1"
                value={petConfig.scale}
                onChange={(e) =>
                  setPetConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                }
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Custom CTA Button Texts */}
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-1">Follow CTA Text:</span>
              <input
                type="text"
                value={carousel.installSlide.followButtonText || '+ FOLLOW'}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, followButtonText: e.target.value },
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                placeholder="+ FOLLOW"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-1">Save CTA Text:</span>
              <input
                type="text"
                value={carousel.installSlide.saveButtonText || 'SAVE THIS'}
                onChange={(e) =>
                  setCarousel((prev) => ({
                    ...prev,
                    installSlide: { ...prev.installSlide, saveButtonText: e.target.value },
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                placeholder="SAVE THIS"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Stage Preview */}
      <div className="relative flex flex-col items-center justify-center min-h-[520px] bg-slate-950/60 rounded-2xl p-4 sm:p-8 border border-slate-800/80 overflow-hidden">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-xl transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Live Export Progress Banner */}
        {exportProgress && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-indigo-950/90 border border-indigo-500/80 text-indigo-200 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Render Target Slide */}
        <div
          ref={slideRef}
          className={`transition-all duration-300 rounded-3xl shadow-2xl overflow-hidden ${getAspectRatioClasses(
            carousel.settings.aspectRatio
          )}`}
        >
          {currentSlideIndex === 0 ? (
            /* First Page: Template / Cover Hook */
            <CoverSlideView
              carousel={carousel}
              petConfig={petConfig}
              totalSlides={totalSlides}
            />
          ) : currentSlideIndex === totalSlides - 1 ? (
            /* End Page: How to install, git clone & AI setup */
            <InstallSlideView
              carousel={carousel}
              totalSlides={totalSlides}
            />
          ) : (
            /* Individual Repo Slide (Pages 2 through N-1) */
            <RepoSlideView
              repo={carousel.repos[currentSlideIndex - 1]}
              petConfig={petConfig}
              slideIndex={currentSlideIndex}
              totalSlides={totalSlides}
              themeId={carousel.theme}
              bgEffect={carousel.settings.bgEffect}
            />
          )}
        </div>
      </div>

      {/* Slide Thumbnails & Carousel Pagination Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {/* Slide 1: Cover */}
        <button
          onClick={() => setCurrentSlideIndex(0)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
            currentSlideIndex === 0
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/60'
          }`}
        >
          01 Cover Hook
        </button>

        {/* Repo Slides */}
        {carousel.repos.map((repo, idx) => {
          const slideNum = idx + 1;
          const isActive = currentSlideIndex === slideNum;
          return (
            <button
              key={repo.id || idx}
              onClick={() => setCurrentSlideIndex(slideNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/60'
              }`}
            >
              0{slideNum + 1} {repo.repoName || `Repo ${idx + 1}`}
            </button>
          );
        })}

        {/* End Slide: Install */}
        <button
          onClick={() => setCurrentSlideIndex(totalSlides - 1)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
            currentSlideIndex === totalSlides - 1
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/60'
          }`}
        >
          0{totalSlides} How to Install
        </button>
      </div>
    </div>
  );
};
