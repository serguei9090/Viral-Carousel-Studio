export type SlideType = 'cover' | 'repo' | 'install';

export type AspectRatio =
  | 'vertical-9-16'
  | 'horizontal-16-9'
  | 'square-1-1'
  | 'portrait-4-5'
  | 'horizontal'
  | 'vertical'
  | 'square';

export interface RepoSlideData {
  id: string;
  index: number;
  repoName: string;
  author: string;
  fullRepo: string;
  headlineLead: string;
  headlineAccent: string;
  summary: string;
  punchline: string;
  cardDescription: string;
  language: string;
  languageColor: string;
  stars: string;
  forks: string;
  badge: string;
  githubUrl: string;
  cloneCommand: string;
  useCases: string[];
}

export type ButtonSize = 'compact' | 'balanced' | 'hero';

export type BackgroundEffect =
  | 'none'
  | 'colorful-splash'
  | 'aurora-glow'
  | 'studio-spotlight'
  | 'subtle-grid';

export interface InstallSlideData {
  titleLead: string;
  titleAccent: string;
  description: string;
  cloneHighlightRepo: string;
  agentPromptText: string;
  ctaTextLead: string;
  ctaTextAccent: string;
  followButtonText: string;
  saveButtonText: string;
  buttonStyle?: 'pill-capsule' | 'modern-squircle' | 'segmented-bar' | 'stacked-full';
  buttonSize?: ButtonSize;
  agentTip?: string;
}

export interface CarouselData {
  id: string;
  topic: string;
  coverTitle: string;
  coverTitleAccent: string;
  coverSubtitle: string;
  editionBadge: string;
  quickSpecs?: string;
  theme:
    | 'editorial-cream'
    | 'designer-splash'
    | 'aurora-prism'
    | 'dark-neo'
    | 'cyber-slate'
    | 'sunset-minimal'
    | 'monochrome'
    | 'neon-cyberpunk'
    | 'luxury-gold'
    | 'tokyo-night'
    | 'nordic-frost';
  repos: RepoSlideData[];
  installSlide: InstallSlideData;
  settings: {
    maxRepos: number;
    showSwipeHints: boolean;
    aspectRatio: AspectRatio;
    buttonStyle?: 'pill-capsule' | 'modern-squircle' | 'segmented-bar' | 'stacked-full';
    buttonSize?: ButtonSize;
    bgEffect?: BackgroundEffect;
  };
}

export interface PetCharacterConfig {
  enabled: boolean;
  type: 'blank-space' | 'robot-magnifier' | 'robot-desk' | 'cute-cybercat' | 'pixel-fox' | 'robot' | 'cyber-cat' | 'custom';
  customImageUrl?: string;
  showPlacementGuides: boolean;
  scale: number;
  position?: 'stage-center' | 'bottom-right' | 'top-right';
  alignment?: 'left' | 'center' | 'right';
}

export interface PostCardData {
  title: string;
  tagline: string;
  summary: string;
  useCases: string[];
  category: string;
  callToAction: string;
  githubUrl?: string;
  githubStars?: string;
  authorOrOrg?: string;
  theme?: string;
}

export interface CharacterLimits {
  title: number;
  tagline: number;
  summary: number;
  useCaseItem: number;
  category: number;
  callToAction: number;
}

export const STRICT_LIMITS: CharacterLimits = {
  title: 28,
  tagline: 45,
  summary: 110,
  useCaseItem: 55,
  category: 20,
  callToAction: 25,
};

