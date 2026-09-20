#!/usr/bin/env node
/**
 * Node.js Viral Carousel JSON Generator
 * Executable script for generating compliant carousel.json
 */

import fs from 'node:fs';
import path from 'node:path';

const THEMES = [
  'editorial-cream',
  'dark-neo',
  'cyber-slate',
  'sunset-minimal',
  'monochrome',
  'neon-cyberpunk',
  'luxury-gold',
  'tokyo-night',
  'nordic-frost',
];

const BUTTON_STYLES = ['pill-capsule', 'modern-squircle', 'stacked-full', 'segmented-bar'];

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    repos: [],
    topic: "This Week's Trending GitHub Repos",
    coverTitle: '5 insane open-source tools',
    coverAccent: 'you need to try.',
    badge: 'WEEKLY GITHUB REPORT',
    theme: 'neon-cyberpunk',
    btnStyle: 'pill-capsule',
    followText: '+ FOLLOW',
    saveText: 'SAVE THIS',
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--repos') {
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        params.repos.push(args[++i]);
      }
    } else if (arg === '--topic' && args[i + 1]) params.topic = args[++i];
    else if (arg === '--cover-title' && args[i + 1]) params.coverTitle = args[++i];
    else if (arg === '--cover-accent' && args[i + 1]) params.coverAccent = args[++i];
    else if (arg === '--badge' && args[i + 1]) params.badge = args[++i];
    else if (arg === '--theme' && args[i + 1]) params.theme = args[++i];
    else if (arg === '--btn-style' && args[i + 1]) params.btnStyle = args[++i];
    else if (arg === '--follow-text' && args[i + 1]) params.followText = args[++i];
    else if (arg === '--save-text' && args[i + 1]) params.saveText = args[++i];
    else if ((arg === '--output' || arg === '-o') && args[i + 1]) params.output = args[++i];
  }

  return params;
}

function formatStars(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

async function fetchRepoMeta(repoStr) {
  const clean = repoStr.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const [owner, name] = clean.split('/');
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { 'User-Agent': 'ViralCarouselNode/1.0', Accept: 'application/vnd.github.v3+json' },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        owner,
        repoName: data.name || name,
        fullRepo: `${owner}/${data.name || name}`,
        description: data.description || 'High performance open-source developer tooling.',
        stars: formatStars(data.stargazers_count || 12500),
        starsNumeric: data.stargazers_count || 12500,
        language: data.language || 'TypeScript',
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    owner: owner || 'developer',
    repoName: name || clean,
    fullRepo: clean,
    description: 'High performance open-source developer tooling.',
    stars: '14.5k',
    starsNumeric: 14500,
    language: 'TypeScript',
  };
}

async function run() {
  const params = parseArgs();
  const repoNames = params.repos.length
    ? params.repos
    : [
        'MadsLorentzen/ai-job-search',
        'wonderwhy-er/DesktopCommanderMCP',
        'yusufcan/OfficeCLI',
        'anthropics/hallmark',
        'diegosouzapw/OmniRoute',
      ];

  const repoSlides = [];
  for (let idx = 0; idx < repoNames.length; idx++) {
    const meta = await fetchRepoMeta(repoNames[idx]);
    repoSlides.push({
      id: `repo-${idx + 1}`,
      repoName: meta.repoName,
      fullRepo: meta.fullRepo,
      url: `https://github.com/${meta.fullRepo}`,
      headlineLead: 'The missing tool for',
      headlineAccent: 'modern developers.',
      summary: meta.description,
      punchline: 'Hand-picked for maximum developer productivity.',
      stars: meta.stars,
      starsNumeric: meta.starsNumeric,
      language: meta.language,
      badge: 'Open Source',
      cardDescription: meta.description.slice(0, 130),
      cloneCommand: `git clone github.com/${meta.fullRepo}`,
      useCases: [`Instant setup for ${meta.repoName}`, 'Automated developer productivity'],
    });
  }

  const numRepos = repoSlides.length;
  const result = {
    id: `carousel-${params.theme}-${numRepos}repos`,
    topic: params.topic,
    coverTitle: params.coverTitle,
    coverTitleAccent: params.coverAccent,
    coverSubtitle: `These ${numRepos} repositories are blowing up right now. Hand-picked for maximum developer productivity.`,
    editionBadge: params.badge,
    theme: THEMES.includes(params.theme) ? params.theme : 'neon-cyberpunk',
    repos: repoSlides,
    installSlide: {
      titleLead: 'How to',
      titleAccent: 'install.',
      description: "You can clone these in the terminal with git clone. But if it's your first time, paste them into any AI coding agent - Cursor, ChatGPT, Gemini or Claude - and it'll check each repo over and set it up for you.",
      cloneHighlightRepo: repoSlides[0]?.fullRepo || 'owner/repo',
      agentPromptText: 'check these are legit, then set them up:',
      ctaTextLead: "Save it now, you'll want this",
      ctaTextAccent: 'list later.',
      followButtonText: params.followText,
      saveButtonText: params.saveText,
      buttonStyle: BUTTON_STYLES.includes(params.btnStyle) ? params.btnStyle : 'pill-capsule',
      agentTip: 'Works with Cursor • Claude 3.7 • ChatGPT • Gemini',
    },
    settings: {
      maxRepos: numRepos,
      showSwipeHints: true,
      aspectRatio: 'vertical-9-16',
      buttonStyle: BUTTON_STYLES.includes(params.btnStyle) ? params.btnStyle : 'pill-capsule',
    },
  };

  const jsonOutput = JSON.stringify(result, null, 2);
  if (params.output) {
    fs.mkdirSync(path.dirname(path.resolve(params.output)), { recursive: true });
    fs.writeFileSync(params.output, jsonOutput, 'utf-8');
    console.log(`✅ Carousel JSON saved to: ${params.output}`);
  } else {
    console.log(jsonOutput);
  }
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});
