import React from 'react';
import { CarouselData, PetCharacterConfig } from '../types';
import { THEME_STYLES } from '../themeStyles';
import { CharacterStage } from './CharacterStage';
import { SlideBackgroundEffect } from './SlideBackgroundEffect';
import { Sparkles, ArrowRight, Star, GitFork, Flame } from 'lucide-react';

interface CoverSlideViewProps {
  carousel: CarouselData;
  petConfig: PetCharacterConfig;
  totalSlides: number;
}

export const CoverSlideView: React.FC<CoverSlideViewProps> = ({
  carousel,
  petConfig,
  totalSlides,
}) => {
  const theme = THEME_STYLES[carousel.theme] || THEME_STYLES['editorial-cream'];
  const bgEffect = carousel.settings.bgEffect || theme.defaultBgEffect || 'none';

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-7 sm:p-9 relative overflow-hidden select-none transition-colors duration-200 ${theme.bgClass}`}
      style={{ color: theme.textHex }}
    >
      {/* Dynamic Background Effect (Colorful Splash Designer / Aurora / Spotlight / Grid) */}
      <SlideBackgroundEffect
        effect={bgEffect}
        isDark={theme.isDark}
        accentColor={theme.accentHex}
      />

      {/* Top Header Row: Clean, balanced, single-line badges with zero clipping */}
      <div className="flex items-center justify-between gap-3 z-10">
        <span
          className="whitespace-nowrap text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full uppercase flex-shrink-0 shadow-sm"
          style={{
            backgroundColor: theme.isDark ? '#1E293B' : '#EFECE6',
            color: theme.accentHex,
          }}
        >
          {carousel.editionBadge || 'WEEKLY GITHUB REPORT'}
        </span>

        <span
          className="whitespace-nowrap text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-md uppercase flex-shrink-0 opacity-80"
          style={{
            backgroundColor: theme.isDark ? '#1E293B' : '#EFECE6',
            color: theme.isDark ? '#94A3B8' : '#78716C',
          }}
        >
          Open Source
        </span>
      </div>

      {/* Main Cover Hook Headline */}
      <div className="my-auto space-y-4 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-1.5"
              style={{ color: theme.accentHex }}
            >
              <Flame className="w-4 h-4 fill-current" />
              Curated Developer Stack
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.18]"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {carousel.coverTitle}{' '}
            <span
              className="italic font-normal"
              style={{ color: theme.accentHex }}
            >
              {carousel.coverTitleAccent}
            </span>
          </h1>

          <p
            className="text-sm leading-relaxed max-w-md opacity-80"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {carousel.coverSubtitle}
          </p>
        </div>

        {/* Character Mascot Stage Window (Generous size) */}
        <div className="py-2">
          <CharacterStage
            config={petConfig}
            themeStyle={{
              isDark: theme.isDark,
              accentColor: theme.accentHex,
              stageBg: theme.bgHex,
            }}
            slideIndex={0}
          />
        </div>

        {/* Repos Teaser Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono uppercase tracking-wider opacity-60 block">
            Inside this carousel:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {carousel.repos.map((repo, idx) => (
              <div
                key={repo.id || idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-transform max-w-full"
                style={{
                  backgroundColor: theme.cardBgHex,
                  borderColor: theme.isDark ? '#334155' : '#E5E0D4',
                  color: theme.textHex,
                }}
              >
                <span className="font-bold text-[10px] flex-shrink-0" style={{ color: theme.accentHex }}>
                  0{idx + 1}
                </span>
                <span className="font-medium text-[11px] truncate max-w-[150px] sm:max-w-[200px]">{repo.repoName}</span>
                {repo.stars && (
                  <span className="text-[10px] opacity-60 flex items-center gap-0.5 ml-0.5 flex-shrink-0">
                    <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                    {repo.stars}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation Hints */}
      <div
        className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider pt-4 border-t z-10"
        style={{ borderColor: theme.isDark ? '#1E293B' : '#E7E3D8' }}
      >
        <span className="opacity-60 font-semibold">
          01 / {String(totalSlides).padStart(2, '0')}
        </span>
        <span
          className="font-bold flex items-center gap-1"
          style={{ color: theme.accentHex }}
        >
          Swipe to explore
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
