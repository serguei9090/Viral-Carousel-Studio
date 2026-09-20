---
name: carousel-generator
description: Generates standardized, high-converting TikTok & Instagram (9:16) developer carousel data JSON for viral GitHub repository showcases. Features Newsreader serif hooks, 3D character mascot stage slots, single-line action buttons, and terminal installation guides.
---

# Viral GitHub Carousel Generator Skill

This skill allows any AI coding agent, workflow automation engine (e.g. n8n), or CLI tool to generate pixel-perfect, high-converting `carousel.json` presentations ready for rendering, image export, and social publishing on TikTok, Instagram Reels, and LinkedIn.

---

## 1. Architectural Principles & Layout Blueprint

Every viral developer carousel follows a strictly validated 7-slide sequence modeled after top-performing tech creators (e.g., Willy Westside, 100k+ organic views per carousel):

| Slide | Role | Key Components |
| :--- | :--- | :--- |
| **01 (Cover)** | **The Hook** | Top Edition Capsule Badge (`WEEKLY GITHUB REPORT`), `Open Source` indicator, Newsreader serif headline with italic accent (`5 insane open-source tools *you need to try.*`), Mascot Window, Quick repo preview tags. |
| **02 - 06 (Repos)** | **The 5 Tools** | Slide number (`02 / 07`), Repo name, 2-line curiosity hook, 1-2 sentence developer summary, Mascot Stage Window (centered 3D robot/pet), Repo Spec Card with stars & category tag, and Bottom pagination. |
| **07 (Install)** | **Conversion / CTA** | Terminal window with `git clone` highlight and copyable AI agent setup prompt (`check these are legit, then set them up:`), AI Agent compatibility badge, and dual CTA action buttons. |

---

## 2. Formatting & Anti-Slop Rules

To ensure visual elegance and prevent mobile layout clipping:

1. **Single-Line Button Labels**:
   * **Rule**: Text inside buttons, pills, and badges **MUST NEVER WRAP** or truncate with ellipses.
   * **Preferred Follow CTA**: `+ FOLLOW` or `FOLLOW` (fits on any screen without overflow).
   * **Preferred Save CTA**: `SAVE THIS` or `SAVE` (drives the #1 algorithm metric on TikTok/Instagram).
   * If longer copy like `+ FOLLOW FOR MORE` is requested, set `buttonStyle` to `stacked-full` so buttons span the full width of the card.
2. **Top Header Badge**:
   * Keep `editionBadge` under 24 characters (e.g. `WEEKLY GITHUB REPORT`, `EDITION #08`).
   * Must use `whitespace-nowrap`.
3. **Typography**:
   * Headings: `Newsreader` (or Georgia/serif), bold with italic punchline in theme accent color.
   * Monospace specs: `JetBrains Mono` / `ui-monospace` for commands, numbers, and tags.
   * Body: Clean sans-serif with high-contrast neutral colors.
4. **Mascot Window**:
   * The carousel features a dedicated center stage window for 3D robots, mascots, or custom avatars (`robot-magnifier`, `robot-desk`, or `blank-space` for downstream image compositing).

---

## 3. Running the Generator Script

Both a **Python** generator and a **Node.js** generator are included in the repository.

### Option A: Python CLI (Recommended for external agents & scripts)

```bash
# Generate default trending carousel
python3 scripts/generate_carousel.py --output carousel.json

# Custom repos and theme
python3 scripts/generate_carousel.py \
  --repos "MadsLorentzen/ai-job-search" "anthropics/hallmark" "diegosouzapw/OmniRoute" \
  --topic "Best AI Infrastructure Repos" \
  --cover-title "3 tools changing AI" \
  --cover-accent "forever." \
  --theme "neon-cyberpunk" \
  --btn-style "pill-capsule" \
  --follow-text "+ FOLLOW" \
  --save-text "SAVE THIS" \
  --output ./carousel.json
```

### Option B: Node.js / npm Script

```bash
npm run generate:json -- --theme luxury-gold --output ./carousel.json
```

Or execute directly:
```bash
node scripts/generate_carousel.mjs --theme neon-cyberpunk --output ./carousel.json
```

---

## 4. Theme Palettes Reference

| Theme ID | Style | Background | Accent |
| :--- | :--- | :--- | :--- |
| `editorial-cream` | Warm editorial print | `#FAF7F0` (Cream) | `#D95D39` (Burnt Orange) |
| `neon-cyberpunk` | Electric terminal | `#080C14` (Deep obsidian) | `#10E57A` (Neon Lime) |
| `luxury-gold` | Matte luxury charcoal | `#0C0D0F` (Charcoal) | `#E2BA76` (Champagne Gold) |
| `tokyo-night` | Midnight synthwave | `#16161E` (Night indigo) | `#F7768E` (Sakura Magenta) |
| `nordic-frost` | Scandinavian clean slate | `#F1F5F9` (Arctic slate) | `#2563EB` (Cobalt Blue) |
| `dark-neo` | Modern tech dark mode | `#0B0F19` (Navy black) | `#6366F1` (Indigo) |
| `cyber-slate` | Matrix hacker dark | `#0F172A` (Slate) | `#38BDF8` (Cyan) |

---

## 5. JSON Schema Summary

A valid `carousel.json` contains:

```json
{
  "id": "unique-batch-id",
  "topic": "This Week's Trending GitHub Repos",
  "coverTitle": "5 insane open-source tools",
  "coverTitleAccent": "you need to try.",
  "coverSubtitle": "These 5 repositories are blowing up right now. Hand-picked for maximum developer productivity.",
  "editionBadge": "WEEKLY GITHUB REPORT",
  "theme": "neon-cyberpunk",
  "repos": [
    {
      "id": "repo-1",
      "repoName": "ai-job-search",
      "fullRepo": "MadsLorentzen/ai-job-search",
      "url": "https://github.com/MadsLorentzen/ai-job-search",
      "headlineLead": "Never apply manually",
      "headlineAccent": "again.",
      "summary": "Automates the entire tech job hunt. Scrapes job boards and matches qualifications.",
      "punchline": "Like having an AI recruitment agent working for you 24/7.",
      "stars": "22.8k",
      "starsNumeric": 22818,
      "language": "Python",
      "badge": "AI Agent",
      "cardDescription": "An autonomous agent that scans listings and generates tailored resumes.",
      "cloneCommand": "git clone github.com/MadsLorentzen/ai-job-search",
      "useCases": ["Tailored resume generation", "Autonomous daily applications"]
    }
  ],
  "installSlide": {
    "titleLead": "How to",
    "titleAccent": "install.",
    "description": "You can clone these in the terminal with git clone. But if it's your first time, paste them into any AI coding agent - Cursor, ChatGPT, Gemini or Claude - and it'll check each repo over and set it up for you.",
    "cloneHighlightRepo": "MadsLorentzen/ai-job-search",
    "agentPromptText": "check these are legit, then set them up:",
    "ctaTextLead": "Save it now, you'll want this",
    "ctaTextAccent": "list later.",
    "followButtonText": "+ FOLLOW",
    "saveButtonText": "SAVE THIS",
    "buttonStyle": "pill-capsule",
    "agentTip": "Works with Cursor • Claude 3.7 • ChatGPT • Gemini"
  },
  "settings": {
    "maxRepos": 5,
    "showSwipeHints": true,
    "aspectRatio": "vertical-9-16",
    "buttonStyle": "pill-capsule"
  }
}
```

See `references/carousel-schema.json` for full JSON Schema validation specifications.
