#!/usr/bin/env node

/**
 * Social Post Card & Viral Carousel CLI Generator
 * Usage:
 *   npx tsx cli.ts --repos "MadsLorentzen/ai-job-search,wonderwhy-er/DesktopCommanderMCP,iOfficeAI/OfficeCLI" --theme editorial-cream --out ./dist/carousel
 *   npx tsx cli.ts --json ./carousel.json --out ./output
 *   npx tsx cli.ts --preset trending --theme dark-neo
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(key: string, defaultValue: string = ''): string {
  const idx = args.indexOf(`--${key}`);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

function hasFlag(key: string): boolean {
  return args.includes(`--${key}`);
}

const reposArg = getArg('repos');
const jsonArg = getArg('json');
const presetArg = getArg('preset');
const themeArg = getArg('theme', 'editorial-cream');
const topicArg = getArg('topic', "This Week's Trending GitHub Repos");
const outDirArg = getArg('out', './carousel-output');
const helpFlag = hasFlag('help') || hasFlag('h');

if (helpFlag || (!reposArg && !jsonArg && !presetArg)) {
  console.log(`
========================================================================
Viral GitHub Social Post Carousel CLI Generator (TikTok & IG Cards)
========================================================================

Usage:
  npx tsx cli.ts [options]

Options:
  --repos <list>     Comma-separated GitHub repos (e.g. "owner/repo1,owner/repo2")
  --json <file>      Path to existing carousel.json file
  --preset <name>    Preset to build (e.g. "trending", "terminal")
  --theme <theme>    Theme name: editorial-cream | dark-neo | cyber-slate | sunset-minimal
  --topic <text>     Cover topic heading (e.g. "Top 5 AI Coding Tools")
  --out <dir>        Output directory for generated files (default: ./carousel-output)
  --help, -h         Show this help message

Examples:
  npx tsx cli.ts --repos "MadsLorentzen/ai-job-search,iOfficeAI/OfficeCLI" --theme editorial-cream
  npx tsx cli.ts --preset trending --out ./my-social-pack
`);
  process.exit(0);
}

// Ensure output directory exists
const outDir = path.resolve(process.cwd(), outDirArg);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// GitHub Fetcher
async function fetchRepoData(repoSlug: string) {
  const cleaned = repoSlug.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const [owner, repo] = cleaned.split('/');

  if (!owner || !repo) {
    throw new Error(`Invalid repo format: "${repoSlug}". Use owner/repo or full GitHub URL.`);
  }

  let repoInfo: any = {};
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'CarouselCLI/1.0', Accept: 'application/vnd.github.v3+json' },
    });
    if (res.ok) {
      repoInfo = await res.json();
    }
  } catch (err) {
    console.warn(`[CLI] Warning: GitHub API error for ${cleaned}:`, err);
  }

  // Fetch README
  let readme = '';
  const branch = repoInfo?.default_branch || 'main';
  try {
    const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
    if (rawRes.ok) {
      readme = await rawRes.text();
    }
  } catch {
    // ignore
  }

  const stars = repoInfo?.stargazers_count
    ? repoInfo.stargazers_count >= 1000
      ? `${(repoInfo.stargazers_count / 1000).toFixed(1)}k`
      : String(repoInfo.stargazers_count)
    : '10.5k';

  const forks = repoInfo?.forks_count ? String(repoInfo.forks_count) : '1,200';
  const language = repoInfo?.language || 'TypeScript';

  return {
    owner,
    repo,
    fullRepo: `${owner}/${repo}`,
    description: repoInfo?.description || 'Open-source developer utility',
    stars,
    forks,
    language,
    readme: readme.slice(0, 5000),
  };
}

// Generate Gemini hooks
async function enhanceWithGemini(repoData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      headlineLead: repoData.description.slice(0, 30) || 'Supercharge your workflow',
      headlineAccent: 'while you sleep.',
      summary: repoData.description || 'Open source developer tool built for speed.',
      punchline: 'Runs directly on your machine.',
      cardDescription: repoData.description || 'Open source tool for developers',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert social media copywriter for developer tools on TikTok and Instagram.
Repository: ${repoData.fullRepo}
Description: ${repoData.description}
README snippet:
${repoData.readme}

Create:
1. headlineLead: First 3-5 punchy words (e.g. "It applies to jobs" or "Run Word and Excel")
2. headlineAccent: The viral italic punchline hook in 2-4 words with trailing period (e.g. "while you sleep." or "from your terminal.")
3. summary: Exactly 1 sentence explaining what it does (under 100 chars).
4. punchline: Bold final sentence (under 45 chars, e.g. "Runs on your machine, off Claude Code.")
5. cardDescription: Brief repo card description (under 50 chars).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlineLead: { type: Type.STRING },
            headlineAccent: { type: Type.STRING },
            summary: { type: Type.STRING },
            punchline: { type: Type.STRING },
            cardDescription: { type: Type.STRING },
          },
          required: ['headlineLead', 'headlineAccent', 'summary', 'punchline', 'cardDescription'],
        },
      },
    });

    return JSON.parse(response.text?.trim() || '{}');
  } catch (err) {
    console.warn(`[CLI] Gemini fallback for ${repoData.fullRepo}:`, err);
    return {
      headlineLead: 'Supercharge your workflow',
      headlineAccent: 'while you sleep.',
      summary: repoData.description || 'Open source tool built for developers.',
      punchline: 'Runs on your own machine.',
      cardDescription: repoData.description || 'Open source tool',
    };
  }
}

// Generate standalone HTML slide file for headless capture or browser preview
function generateSlideHtml(title: string, bodyContent: string, isDark: boolean, bgHex: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600;1,6..72,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .slide-card { width: 420px; height: 746px; font-family: 'Plus Jakarta Sans', sans-serif; }
    .serif-text { font-family: 'Newsreader', serif; }
    .mono-text { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="slide-card overflow-hidden shadow-2xl relative rounded-3xl" style="background-color: ${bgHex};">
    ${bodyContent}
  </div>
</body>
</html>`;
}

async function runCli() {
  console.log(`\n🚀 [CLI] Starting Viral Carousel Generator...`);

  let carousel: any = null;

  if (jsonArg) {
    const jsonPath = path.resolve(process.cwd(), jsonArg);
    console.log(`📂 [CLI] Loading carousel definition from ${jsonPath}...`);
    carousel = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } else if (reposArg) {
    const repoList = reposArg.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
    console.log(`🔍 [CLI] Processing ${repoList.length} repositories...`);

    const reposData: any[] = [];
    for (let i = 0; i < repoList.length; i++) {
      const slug = repoList[i];
      console.log(`  -> [${i + 1}/${repoList.length}] Fetching ${slug}...`);
      const raw = await fetchRepoData(slug);
      const enhanced = await enhanceWithGemini(raw);

      reposData.push({
        id: `repo-${i + 1}`,
        index: i + 1,
        repoName: raw.repo,
        author: raw.owner,
        fullRepo: raw.fullRepo,
        headlineLead: enhanced.headlineLead,
        headlineAccent: enhanced.headlineAccent,
        summary: enhanced.summary,
        punchline: enhanced.punchline,
        cardDescription: enhanced.cardDescription,
        language: raw.language,
        languageColor: raw.language === 'TypeScript' ? '#3178C6' : raw.language === 'Python' ? '#3572A5' : '#DEA584',
        stars: raw.stars,
        forks: raw.forks,
        badge: 'free',
        githubUrl: `https://github.com/${raw.fullRepo}`,
        cloneCommand: `git clone github.com/${raw.fullRepo}`,
        useCases: ['Automate workflows', 'Run on your own machine'],
      });
    }

    carousel = {
      id: `carousel-${Date.now()}`,
      topic: topicArg,
      coverTitle: `${repoList.length} insane open-source tools`,
      coverTitleAccent: 'you need to try.',
      coverSubtitle: `These ${repoList.length} repositories are blowing up right now. Hand-picked for maximum developer productivity.`,
      editionBadge: 'WEEKLY GITHUB REPORT',
      theme: themeArg,
      repos: reposData,
      installSlide: {
        titleLead: 'How to',
        titleAccent: 'install.',
        description: "You can clone these in the terminal with git clone. But if it's your first time, paste them into any AI coding agent - Cursor, ChatGPT, Gemini or Claude - and it'll check each repo over and set it up for you.",
        cloneHighlightRepo: reposData[0]?.fullRepo || 'owner/repo',
        agentPromptText: 'check these are legit, then set them up:',
        ctaTextLead: "Save it now, you'll want this",
        ctaTextAccent: 'list later.',
        followButtonText: '+ FOLLOW FOR MORE',
        saveButtonText: 'SAVE THIS',
      },
    };
  } else {
    // Preset
    console.log(`✨ [CLI] Using default trending repos preset...`);
    const { defaultCarouselData } = await import('./src/carouselData.js').catch(async () => await import('./src/carouselData.ts'));
    carousel = defaultCarouselData;
  }

  // Save carousel.json
  const jsonOutPath = path.join(outDir, 'carousel.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(carousel, null, 2), 'utf-8');
  console.log(`✅ [CLI] Saved Carousel JSON: ${jsonOutPath}`);

  // Generate slides HTML files
  const totalSlides = 1 + carousel.repos.length + 1;
  const isDark = carousel.theme === 'dark-neo' || carousel.theme === 'cyber-slate' || carousel.theme === 'monochrome';
  const bgHex = isDark ? '#090D16' : '#FBF9F4';
  const accentHex = isDark ? '#818CF8' : '#E05A2B';
  const textHex = isDark ? '#F8FAFC' : '#1C1917';

  // 1. Cover Slide HTML
  const coverHtml = `
  <div class="h-full flex flex-col justify-between p-8" style="color: ${textHex}">
    <div class="flex justify-between items-center text-xs mono-text font-bold">
      <span class="px-2.5 py-1 rounded-full uppercase" style="background: ${isDark ? '#1E293B' : '#EFECE6'}; color: ${accentHex}">
        ${carousel.editionBadge}
      </span>
      <span class="text-[10px] opacity-70 uppercase tracking-wider">Open Source Edition</span>
    </div>
    <div class="my-auto space-y-4">
      <h1 class="text-3xl font-bold leading-tight serif-text">
        ${carousel.coverTitle} <span class="italic" style="color: ${accentHex}">${carousel.coverTitleAccent}</span>
      </h1>
      <p class="text-xs opacity-80 leading-relaxed">${carousel.coverSubtitle}</p>
      <div class="py-6 flex justify-center">
        <div class="w-48 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center" style="border-color: ${accentHex}50">
          <span class="text-xs font-bold" style="color: ${accentHex}">Character Mascot Slot</span>
          <span class="text-[10px] opacity-70 mt-1">Ready for n8n robot or pet overlay</span>
        </div>
      </div>
    </div>
    <div class="flex justify-between text-xs mono-text uppercase border-t pt-3" style="border-color: ${isDark ? '#334155' : '#E5E0D4'}">
      <span class="opacity-60 font-semibold">01 / ${String(totalSlides).padStart(2, '0')}</span>
      <span class="font-bold" style="color: ${accentHex}">SWIPE TO EXPLORE &rarr;</span>
    </div>
  </div>`;
  fs.writeFileSync(path.join(outDir, '01_cover_slide.html'), generateSlideHtml('01 Cover Slide', coverHtml, isDark, bgHex));

  // 2. Repo Slides HTML
  carousel.repos.forEach((repo: any, idx: number) => {
    const slideNum = idx + 2;
    const formattedNum = String(slideNum).padStart(2, '0');
    const formattedTotal = String(totalSlides).padStart(2, '0');

    const repoHtml = `
    <div class="h-full flex flex-col justify-between p-8" style="color: ${textHex}">
      <div class="space-y-2">
        <div class="flex items-baseline gap-2">
          <span class="font-bold mono-text text-sm" style="color: ${accentHex}">0${idx + 1}</span>
          <h2 class="serif-text italic text-lg">${repo.repoName}</h2>
        </div>
        <h3 class="serif-text text-2xl font-bold leading-tight">
          ${repo.headlineLead} <span class="italic" style="color: ${accentHex}">${repo.headlineAccent}</span>
        </h3>
        <p class="text-xs opacity-90 leading-relaxed">${repo.summary} <strong>${repo.punchline}</strong></p>
      </div>

      <div class="my-auto py-4 flex justify-center">
        <div class="w-48 h-40 rounded-2xl border-2 border-dashed flex items-center justify-center" style="border-color: ${accentHex}40">
          <span class="text-[11px] font-mono opacity-80" style="color: ${accentHex}">[Character Stage Window]</span>
        </div>
      </div>

      <div class="rounded-2xl p-4 shadow-xl border" style="background: ${isDark ? '#0F172A' : '#FFFFFF'}; border-color: ${isDark ? '#334155' : '#E5E0D4'}">
        <div class="font-mono text-xs font-bold">${repo.fullRepo}</div>
        <p class="text-xs opacity-80 mt-1">${repo.cardDescription || repo.summary}</p>
        <div class="flex justify-between items-center text-xs mono-text pt-2 mt-2 border-t" style="border-color: ${isDark ? '#1E293B' : '#F1EFE9'}">
          <div class="flex gap-3 items-center text-[11px]">
            <span>${repo.language}</span>
            <span>★ ${repo.stars}</span>
          </div>
          <span class="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded" style="background: ${accentHex}20; color: ${accentHex}">${repo.badge}</span>
        </div>
      </div>

      <div class="flex justify-between text-xs mono-text uppercase border-t pt-3" style="border-color: ${isDark ? '#334155' : '#E5E0D4'}">
        <span class="opacity-60">${formattedNum} / ${formattedTotal}</span>
        <span class="font-bold text-[10px]" style="color: ${accentHex}">HOW TO INSTALL AT THE END &rarr;</span>
      </div>
    </div>`;
    fs.writeFileSync(path.join(outDir, `${formattedNum}_${repo.repoName}.html`), generateSlideHtml(`Slide ${formattedNum}`, repoHtml, isDark, bgHex));
  });

  // 3. Install Slide HTML
  const install = carousel.installSlide;
  const formattedTotal = String(totalSlides).padStart(2, '0');
  const installHtml = `
  <div class="h-full flex flex-col justify-between p-8" style="color: ${textHex}">
    <div class="space-y-2">
      <h2 class="serif-text text-3xl font-bold">${install.titleLead} <span class="italic" style="color: ${accentHex}">${install.titleAccent}</span></h2>
      <p class="text-xs opacity-80 leading-relaxed">${install.description}</p>
    </div>

    <div class="my-auto rounded-2xl p-4 shadow-2xl mono-text text-xs bg-zinc-900 text-zinc-100 border border-zinc-800">
      <div class="flex gap-1.5 pb-2 mb-2 border-b border-zinc-800">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
      </div>
      <div class="space-y-1 text-[11px]">
        <span class="text-zinc-500"># clone it yourself:</span>
        <div class="text-amber-300">&gt; git clone github.com/${install.cloneHighlightRepo}</div>
        <div class="pt-2 text-zinc-500"># first time? paste to AI agent:</div>
        <div class="text-white">&gt; ${install.agentPromptText}</div>
        <div class="pl-3 text-amber-300">
          ${carousel.repos.map((r: any) => `<div>${r.fullRepo}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="serif-text text-base font-bold text-center">${install.ctaTextLead} <span class="italic" style="color: ${accentHex}">${install.ctaTextAccent}</span></h3>
      <div class="flex gap-2 text-xs font-bold">
        <div class="flex-1 py-2 text-center rounded-full text-white uppercase shadow" style="background: ${accentHex}">
          ${install.followButtonText}
        </div>
        <div class="flex-1 py-2 text-center rounded-full text-white uppercase shadow bg-zinc-900 border border-zinc-700">
          ${install.saveButtonText}
        </div>
      </div>
      <div class="flex justify-between text-xs mono-text uppercase border-t pt-2" style="border-color: ${isDark ? '#334155' : '#E5E0D4'}">
        <span class="opacity-60">${formattedTotal} / ${formattedTotal}</span>
        <span class="font-bold" style="color: ${accentHex}">THE END</span>
      </div>
    </div>
  </div>`;
  fs.writeFileSync(path.join(outDir, `${formattedTotal}_install_slide.html`), generateSlideHtml('Install Slide', installHtml, isDark, bgHex));

  console.log(`\n🎉 [CLI] Success! Generated ${totalSlides} slides in ${outDir}:`);
  console.log(`  - 01_cover_slide.html`);
  carousel.repos.forEach((r: any, idx: number) => {
    console.log(`  - ${String(idx + 2).padStart(2, '0')}_${r.repoName}.html`);
  });
  console.log(`  - ${formattedTotal}_install_slide.html`);
  console.log(`  - carousel.json (complete state)`);
  console.log(`\nTip: You can convert these to PNG directly with headless chrome, puppeteer, or open them in your browser/app!\n`);
}

runCli().catch((err) => {
  console.error('[CLI Error]:', err);
  process.exit(1);
});
