import React from 'react';
import { CarouselData, ButtonSize } from '../types';
import { THEME_STYLES } from '../themeStyles';
import { SlideBackgroundEffect } from './SlideBackgroundEffect';
import { Bookmark, Plus, Terminal, Check } from 'lucide-react';

interface InstallSlideViewProps {
  carousel: CarouselData;
  totalSlides: number;
}

export const InstallSlideView: React.FC<InstallSlideViewProps> = ({
  carousel,
  totalSlides,
}) => {
  const theme = THEME_STYLES[carousel.theme] || THEME_STYLES['editorial-cream'];
  const bgEffect = carousel.settings.bgEffect || theme.defaultBgEffect || 'none';
  const formattedSlideNum = String(totalSlides).padStart(2, '0');
  const install = carousel.installSlide;

  const highlightRepo = install.cloneHighlightRepo || carousel.repos[0]?.fullRepo || 'owner/repo';

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden select-none transition-colors duration-200 ${theme.bgClass}`}
      style={{ color: theme.textHex }}
    >
      {/* Dynamic Background Effect */}
      <SlideBackgroundEffect
        effect={bgEffect}
        isDark={theme.isDark}
        accentColor={theme.accentHex}
      />

      {/* 1. Header Section */}
      <div className="space-y-2 z-10">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-none"
          style={{ fontFamily: 'Newsreader, Georgia, serif' }}
        >
          {install.titleLead || 'How to'}{' '}
          <span
            className="italic font-normal"
            style={{ color: theme.accentHex }}
          >
            {install.titleAccent || 'install.'}
          </span>
        </h2>

        <p
          className="text-xs sm:text-[13px] leading-relaxed opacity-80 max-w-lg"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {install.description}
        </p>
      </div>

      {/* 2. macOS Terminal Code Window (Exact Replica of Screenshot 1) */}
      <div className="my-auto py-2 z-10 space-y-2">
        <div
          className="rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden font-mono text-xs"
          style={{ backgroundColor: '#18181B', color: '#F4F4F5' }}
        >
          {/* Terminal Window Header with 3 traffic light dots */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-[#111113] border-b border-zinc-800">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
            <span className="text-[10px] text-zinc-400 ml-2 font-mono">terminal — bash</span>
          </div>

          {/* Terminal Code Body */}
          <div className="p-4 sm:p-5 space-y-3 leading-relaxed text-[11px] sm:text-xs">
            {/* Section 1: Clone yourself */}
            <div className="space-y-1">
              <span className="text-zinc-500 block"># clone it yourself:</span>
              <div className="flex items-center gap-1.5 text-orange-400">
                <span className="text-zinc-400">&gt;</span>
                <span className="font-semibold text-white">git clone</span>
                <span className="text-amber-300 truncate">github.com/{highlightRepo}</span>
              </div>
            </div>

            {/* Section 2: Paste to AI Agent */}
            <div className="space-y-1 pt-1 border-t border-zinc-800/80">
              <span className="text-zinc-500 block"># first time? paste these to any AI agent:</span>
              <div className="flex items-center gap-1.5 text-white font-medium">
                <span className="text-zinc-400">&gt;</span>
                <span>{install.agentPromptText || 'check these are legit, then set them up:'}</span>
              </div>

              {/* List of all repos in carousel */}
              <div className="pl-4 space-y-0.5 text-amber-300 font-medium">
                {carousel.repos.map((repo, idx) => (
                  <div key={repo.id || idx} className="hover:text-white transition-colors">
                    {repo.fullRepo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Micro-Tip for AI Agent execution */}
        <div className="flex items-center justify-between text-[10px] font-mono opacity-70 px-1">
          <span>{install.agentTip || '⚡ Works with Cursor • Claude 3.7 • ChatGPT • Gemini'}</span>
          <span className="hidden sm:inline">30s setup</span>
        </div>
      </div>

      {/* 3. Call to Action & Modern Action Buttons */}
      <div className="space-y-3 z-10">
        <h3
          className="text-base sm:text-lg font-bold tracking-tight text-center sm:text-left"
          style={{ fontFamily: 'Newsreader, Georgia, serif' }}
        >
          {install.ctaTextLead || "Save it now, you'll want this"}{' '}
          <span
            className="italic font-normal"
            style={{ color: theme.accentHex }}
          >
            {install.ctaTextAccent || 'list later.'}
          </span>
        </h3>

        {/* Designer Action Buttons: Supports Squircle, Capsule Pill, Segmented Bar, or Full-Width Stack */}
        {(() => {
          const btnStyle = install.buttonStyle || carousel.settings.buttonStyle || 'pill-capsule';
          const btnSize = install.buttonSize || carousel.settings.buttonSize || 'balanced';

          // Button sizing classes based on buttonSize idea
          const sizeClasses = {
            compact: {
              height: 'h-9 sm:h-10',
              text: 'text-[10px] sm:text-[11px]',
              padding: 'px-2.5 sm:px-3',
              icon: 'w-3 h-3',
              badge: 'w-3.5 h-3.5',
            },
            balanced: {
              height: 'h-11',
              text: 'text-[11px] sm:text-xs',
              padding: 'px-3 sm:px-4',
              icon: 'w-3.5 h-3.5',
              badge: 'w-4 h-4',
            },
            hero: {
              height: 'h-12 sm:h-13',
              text: 'text-xs sm:text-sm',
              padding: 'px-4 sm:px-5',
              icon: 'w-4 h-4',
              badge: 'w-5 h-5',
            },
          }[btnSize];

          // Clean standard action text: concise, high-converting, fits without breaking
          const rawFollow = install.followButtonText || 'FOLLOW';
          const cleanFollowText = rawFollow.replace(/^\+\s*/, '');
          const cleanSaveText = install.saveButtonText || 'SAVE THIS';

          if (btnStyle === 'stacked-full') {
            // Idea 3: Stacked Full-Width Buttons (Maximum touch area & fits long text easily)
            return (
              <div className="space-y-2">
                <button
                  type="button"
                  className={`w-full ${sizeClasses.height} ${sizeClasses.padding} rounded-xl font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] min-w-0`}
                  style={{
                    backgroundColor: theme.accentHex,
                    color: '#FFFFFF',
                  }}
                >
                  <Plus className={`${sizeClasses.icon} stroke-[3] flex-shrink-0`} />
                  <span className="truncate">{cleanFollowText}</span>
                </button>

                <button
                  type="button"
                  className={`w-full ${sizeClasses.height} ${sizeClasses.padding} rounded-xl font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-2 shadow-md border transition-all active:scale-[0.98] min-w-0`}
                  style={{
                    backgroundColor: theme.isDark ? '#0F172A' : '#1C1917',
                    borderColor: theme.isDark ? '#334155' : '#292524',
                    color: '#FFFFFF',
                  }}
                >
                  <Bookmark className={`${sizeClasses.icon} fill-current text-amber-400 flex-shrink-0`} />
                  <span className="truncate">{cleanSaveText}</span>
                </button>
              </div>
            );
          } else if (btnStyle === 'modern-squircle') {
            // Idea 1: The Modern Tech Squircle (12px continuous radius, Apple/Linear style)
            return (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className={`flex-1 ${sizeClasses.height} ${sizeClasses.padding} rounded-xl font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] min-w-0`}
                  style={{
                    backgroundColor: theme.accentHex,
                    color: '#FFFFFF',
                  }}
                >
                  <Plus className={`${sizeClasses.icon} stroke-[3] flex-shrink-0`} />
                  <span className="truncate">{cleanFollowText}</span>
                </button>

                <button
                  type="button"
                  className={`flex-1 ${sizeClasses.height} ${sizeClasses.padding} rounded-xl font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md border transition-all active:scale-[0.98] min-w-0`}
                  style={{
                    backgroundColor: theme.isDark ? '#0F172A' : '#1C1917',
                    borderColor: theme.isDark ? '#334155' : '#292524',
                    color: '#FFFFFF',
                  }}
                >
                  <Bookmark className={`${sizeClasses.icon} fill-current text-amber-400 flex-shrink-0`} />
                  <span className="truncate">{cleanSaveText}</span>
                </button>
              </div>
            );
          } else if (btnStyle === 'segmented-bar') {
            // Idea 2B: Segmented Dual Action Bar (Joined pill with divider)
            return (
              <div
                className={`flex items-center ${sizeClasses.height} rounded-full p-1 border shadow-lg overflow-hidden`}
                style={{
                  backgroundColor: theme.isDark ? '#0F172A' : '#1C1917',
                  borderColor: theme.isDark ? '#334155' : '#292524',
                }}
              >
                <button
                  type="button"
                  className={`flex-1 h-full rounded-full font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 px-3 transition-colors active:scale-95 min-w-0`}
                  style={{
                    backgroundColor: theme.accentHex,
                    color: '#FFFFFF',
                  }}
                >
                  <Plus className={`${sizeClasses.icon} stroke-[3] flex-shrink-0`} />
                  <span className="truncate">{cleanFollowText}</span>
                </button>
                <div className="w-[1px] h-5 bg-white/20 mx-1 flex-shrink-0" />
                <button
                  type="button"
                  className={`flex-1 h-full rounded-full font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 px-3 text-white hover:bg-white/10 transition-colors active:scale-95 min-w-0`}
                >
                  <Bookmark className={`${sizeClasses.icon} fill-current text-amber-400 flex-shrink-0`} />
                  <span className="truncate">{cleanSaveText}</span>
                </button>
              </div>
            );
          }

          // Idea 2A (Default): The TikTok Hero Capsule Pill with Micro-Badge
          return (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                className={`flex-1 ${sizeClasses.height} ${sizeClasses.padding} rounded-full font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-[0.98] min-w-0`}
                style={{
                  backgroundColor: theme.accentHex,
                  color: '#FFFFFF',
                }}
              >
                <div className={`${sizeClasses.badge} rounded-full bg-white/25 flex items-center justify-center flex-shrink-0`}>
                  <Plus className={`${sizeClasses.icon} stroke-[3] text-white`} />
                </div>
                <span className="truncate">{cleanFollowText}</span>
              </button>

              <button
                type="button"
                className={`flex-1 ${sizeClasses.height} ${sizeClasses.padding} rounded-full font-bold ${sizeClasses.text} uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-md border transition-all active:scale-[0.98] min-w-0`}
                style={{
                  backgroundColor: theme.isDark ? '#0F172A' : '#1C1917',
                  borderColor: theme.isDark ? '#334155' : '#292524',
                  color: '#FFFFFF',
                }}
              >
                <Bookmark className={`${sizeClasses.icon} fill-current flex-shrink-0 text-amber-400`} />
                <span className="truncate">{cleanSaveText}</span>
              </button>
            </div>
          );
        })()}

        {/* Footer: 07 / 07 & THE END (Consistently in down left corner) */}
        <div
          className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider pt-2 border-t"
          style={{ borderColor: theme.isDark ? '#1E293B' : '#E7E3D8' }}
        >
          <span className="opacity-60 font-semibold">
            {formattedSlideNum} / {formattedSlideNum}
          </span>
          <span
            className="font-bold tracking-widest text-[10px]"
            style={{ color: theme.accentHex }}
          >
            THE END
          </span>
        </div>
      </div>
    </div>
  );
};
