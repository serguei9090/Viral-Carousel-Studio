import React from 'react';
import { RepoSlideData, PetCharacterConfig, BackgroundEffect } from '../types';
import { THEME_STYLES } from '../themeStyles';
import { CharacterStage } from './CharacterStage';
import { SlideBackgroundEffect } from './SlideBackgroundEffect';
import { Star, GitFork, ArrowRight, ExternalLink } from 'lucide-react';

interface RepoSlideViewProps {
  repo: RepoSlideData;
  petConfig: PetCharacterConfig;
  slideIndex: number;
  totalSlides: number;
  themeId: string;
  bgEffect?: BackgroundEffect;
}

export const RepoSlideView: React.FC<RepoSlideViewProps> = ({
  repo,
  petConfig,
  slideIndex,
  totalSlides,
  themeId,
  bgEffect,
}) => {
  const theme = THEME_STYLES[themeId] || THEME_STYLES['editorial-cream'];
  const effectiveBgEffect = bgEffect || theme.defaultBgEffect || 'none';
  const formattedIndex = String(repo.index || 1).padStart(2, '0');
  const formattedSlideNum = String(slideIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalSlides).padStart(2, '0');

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden select-none transition-colors duration-200 ${theme.bgClass}`}
      style={{ color: theme.textHex }}
    >
      {/* Dynamic Background Effect */}
      <SlideBackgroundEffect
        effect={effectiveBgEffect}
        isDark={theme.isDark}
        accentColor={theme.accentHex}
      />

      {/* 1. Top Section: Index + Title + Catchy Headline + Description */}
      <div className="space-y-2.5 z-10">
        {/* Number + Repo Name Header */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-bold font-mono"
            style={{ color: theme.accentHex }}
          >
            {formattedIndex}
          </span>
          <h2
            className="text-lg sm:text-xl font-medium tracking-tight"
            style={{ fontFamily: 'Newsreader, Georgia, serif', fontStyle: 'italic' }}
          >
            {repo.repoName}
          </h2>
        </div>

        {/* Viral Hook Headline */}
        <h3
          className="text-2xl sm:text-3xl font-bold tracking-tight leading-[1.18]"
          style={{ fontFamily: 'Newsreader, Georgia, serif' }}
        >
          {repo.headlineLead}{' '}
          <span
            className="italic font-normal"
            style={{ color: theme.accentHex }}
          >
            {repo.headlineAccent}
          </span>
        </h3>

        {/* Short summary sentence + bold punchline */}
        <p
          className="text-xs sm:text-[13px] leading-relaxed opacity-90 max-w-lg"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {repo.summary}{' '}
          <strong className="font-bold opacity-100 block sm:inline mt-0.5 sm:mt-0">
            {repo.punchline}
          </strong>
        </p>
      </div>

      {/* 2. Center Character Mascot Window (More window space for mobile!) */}
      <div className="my-auto py-1 z-10">
        <CharacterStage
          config={petConfig}
          themeStyle={{
            isDark: theme.isDark,
            accentColor: theme.accentHex,
            stageBg: theme.bgHex,
          }}
          slideIndex={slideIndex}
        />
      </div>

      {/* 3. Floating GitHub Card (Exact Replica of Screenshots 2 & 3) */}
      <div className="space-y-3 z-10">
        <div
          className={`rounded-2xl border p-4 shadow-xl transition-all relative overflow-hidden ${theme.cardBgClass}`}
          style={{
            borderColor: theme.isDark ? '#334155' : '#E5E0D4',
            backgroundColor: theme.cardBgHex,
          }}
        >
          {/* Card Top Row: Owner/Repo + GitHub Octocat Icon */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs sm:text-sm font-bold tracking-tight font-mono truncate"
              style={{ color: theme.textHex }}
            >
              {repo.fullRepo}
            </span>

            {/* GitHub Octocat SVG */}
            <svg
              className="w-5 h-5 flex-shrink-0 opacity-80"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </div>

          {/* Repo Description */}
          <p
            className="text-xs mt-1.5 opacity-80 leading-relaxed font-sans line-clamp-2 sm:line-clamp-3"
            style={{ color: theme.textHex }}
          >
            {repo.cardDescription || repo.summary}
          </p>

          {/* Card Bottom Meta Row: Language dot + Stars + Forks + Free badge */}
          <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-black/5 dark:border-white/5 font-mono">
            <div className="flex items-center gap-3">
              {/* Language with colored dot */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: repo.languageColor || '#3178C6' }}
                />
                <span className="text-[11px] font-medium">{repo.language || 'TypeScript'}</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 opacity-80 text-[11px]">
                <Star className="w-3 h-3 fill-current text-amber-400" />
                <span>{repo.stars || '12.5k'}</span>
              </div>

              {/* Forks */}
              {repo.forks && (
                <div className="flex items-center gap-1 opacity-70 text-[11px] hidden sm:flex">
                  <GitFork className="w-3 h-3" />
                  <span>{repo.forks}</span>
                </div>
              )}
            </div>

            {/* Badge (e.g. "free") */}
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                color: theme.accentHex,
                backgroundColor: theme.isDark ? '#1E293B' : '#F5EBE6',
              }}
            >
              {repo.badge || 'free'}
            </span>
          </div>

          {/* Bottom subtle accent line (Rainbow / theme strip) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-blue-500" />
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-rose-500" />
          </div>
        </div>

        {/* 4. Footer Row: 02 / 07 & Navigation CTAs */}
        <div
          className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider pt-2 border-t"
          style={{ borderColor: theme.isDark ? '#1E293B' : '#E7E3D8' }}
        >
          <span className="opacity-60 font-semibold">
            {formattedSlideNum} / {formattedTotal}
          </span>

          <span
            className="font-bold flex items-center gap-1 text-[10px] sm:text-[11px]"
            style={{ color: theme.accentHex }}
          >
            HOW TO INSTALL AT THE END &rarr;
          </span>

          <span className="opacity-60 hidden sm:inline text-[10px]">
            KEEP SWIPING &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
