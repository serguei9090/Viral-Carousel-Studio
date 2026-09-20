import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Helper to initialize Gemini safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const STRICT_LIMITS = {
  title: 28,
  tagline: 45,
  summary: 110,
  useCaseItem: 55,
  category: 20,
  callToAction: 25,
};

function enforceLimits(input: any) {
  const title = String(input.title || "Untitled App").trim().slice(0, STRICT_LIMITS.title);
  const tagline = String(input.tagline || "Open Source Utility").trim().slice(0, STRICT_LIMITS.tagline);
  const summary = String(input.summary || "").trim().slice(0, STRICT_LIMITS.summary);
  
  let useCases: string[] = [];
  if (Array.isArray(input.useCases)) {
    useCases = input.useCases.slice(0, 3).map((uc: any) => String(uc || "").trim().slice(0, STRICT_LIMITS.useCaseItem)).filter(Boolean);
  } else if (typeof input.useCases === "string") {
    useCases = [input.useCases.slice(0, STRICT_LIMITS.useCaseItem)];
  }
  if (useCases.length === 0) {
    useCases = ["Fast automated workflow integration", "Deploy to mobile feeds seamlessly"];
  }

  const category = String(input.category || "Developer Tools").trim().slice(0, STRICT_LIMITS.category);
  const callToAction = String(input.callToAction || "Star on GitHub").trim().slice(0, STRICT_LIMITS.callToAction);

  return {
    title,
    tagline,
    summary,
    useCases,
    category,
    callToAction,
    githubUrl: input.githubUrl || "",
    githubStars: input.githubStars || "",
    authorOrOrg: input.authorOrOrg || "",
    theme: input.theme || "dark-neo",
  };
}

function validatePostData(data: any) {
  const errors: Record<string, string> = {};
  const lengths: Record<string, number> = {
    title: (data.title || "").length,
    tagline: (data.tagline || "").length,
    summary: (data.summary || "").length,
    category: (data.category || "").length,
    callToAction: (data.callToAction || "").length,
  };

  if (lengths.title > STRICT_LIMITS.title) {
    errors.title = `Exceeds max limit of ${STRICT_LIMITS.title} chars (is ${lengths.title})`;
  }
  if (lengths.tagline > STRICT_LIMITS.tagline) {
    errors.tagline = `Exceeds max limit of ${STRICT_LIMITS.tagline} chars (is ${lengths.tagline})`;
  }
  if (lengths.summary > STRICT_LIMITS.summary) {
    errors.summary = `Exceeds max limit of ${STRICT_LIMITS.summary} chars (is ${lengths.summary})`;
  }
  if (lengths.category > STRICT_LIMITS.category) {
    errors.category = `Exceeds max limit of ${STRICT_LIMITS.category} chars (is ${lengths.category})`;
  }
  if (lengths.callToAction > STRICT_LIMITS.callToAction) {
    errors.callToAction = `Exceeds max limit of ${STRICT_LIMITS.callToAction} chars (is ${lengths.callToAction})`;
  }

  if (Array.isArray(data.useCases)) {
    data.useCases.forEach((uc: string, idx: number) => {
      lengths[`useCase_${idx + 1}`] = (uc || "").length;
      if ((uc || "").length > STRICT_LIMITS.useCaseItem) {
        errors[`useCase_${idx + 1}`] = `Item ${idx + 1} exceeds max ${STRICT_LIMITS.useCaseItem} chars`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    lengths,
  };
}

// Parse GitHub URL into owner and repo
function parseGitHubUrl(rawUrl: string): { owner: string; repo: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const cleaned = rawUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // Match github.com/owner/repo
  const fullMatch = cleaned.match(/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (fullMatch) {
    return { owner: fullMatch[1], repo: fullMatch[2] };
  }

  // Match raw owner/repo
  const slashMatch = cleaned.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
  if (slashMatch) {
    return { owner: slashMatch[1], repo: slashMatch[2] };
  }

  return null;
}

// Fetch GitHub README
async function fetchGitHubReadme(owner: string, repo: string): Promise<{ readme: string; repoInfo?: any }> {
  let readme = "";
  let repoInfo: any = null;

  // 1. Fetch repo basic metadata from public GitHub API
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        "User-Agent": "PostGeneratorTool/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (apiRes.ok) {
      repoInfo = await apiRes.json();
    }
  } catch (err) {
    console.warn("Could not fetch GitHub API metadata:", err);
  }

  // 2. Try raw branches: main, master
  const branchCandidates = [repoInfo?.default_branch || "main", "main", "master"];
  for (const branch of Array.from(new Set(branchCandidates))) {
    try {
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
        { headers: { "User-Agent": "PostGeneratorTool/1.0" } }
      );
      if (rawRes.ok) {
        readme = await rawRes.text();
        break;
      }
      // Also try lowercase readme.md
      const rawResLower = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/readme.md`,
        { headers: { "User-Agent": "PostGeneratorTool/1.0" } }
      );
      if (rawResLower.ok) {
        readme = await rawResLower.text();
        break;
      }
    } catch {
      // Continue to next branch
    }
  }

  // 3. Fallback to GitHub README API if raw didn't work
  if (!readme) {
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          "User-Agent": "PostGeneratorTool/1.0",
          Accept: "application/vnd.github.v3.raw",
        },
      });
      if (readmeRes.ok) {
        readme = await readmeRes.text();
      }
    } catch (err) {
      console.warn("Could not fetch via GitHub README API:", err);
    }
  }

  return { readme, repoInfo };
}

// ---------------- API ENDPOINTS ---------------- //

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Sample post data for instant preview or n8n pipeline testing
const samplePostData = {
  title: "Superfile CLI",
  tagline: "Terminal File Manager for Devs",
  summary: "A modern, lightning-fast file manager with live previews, syntax highlighting, and dual panes.",
  useCases: [
    "Navigate code repositories at lightspeed",
    "Dual-pane copy and keyboard productivity",
  ],
  category: "Terminal Tool",
  callToAction: "yorukot/superfile",
  githubUrl: "https://github.com/yorukot/superfile",
  githubStars: "14.2k",
  authorOrOrg: "yorukot",
  theme: "dark-neo",
};

app.get("/api/sample-post", (_req, res) => {
  res.json({
    success: true,
    data: samplePostData,
    limits: STRICT_LIMITS,
    validation: validatePostData(samplePostData),
  });
});

// Schema definition endpoint for n8n or external services
app.get("/api/schema", (_req, res) => {
  res.json({
    description: "Post Card Generator Schema for n8n automation and social visuals",
    limits: STRICT_LIMITS,
    properties: {
      title: { type: "string", maxLength: STRICT_LIMITS.title, description: "App or repo name" },
      tagline: { type: "string", maxLength: STRICT_LIMITS.tagline, description: "Short catchy tagline" },
      summary: { type: "string", maxLength: STRICT_LIMITS.summary, description: "Punchy 1-2 sentence description" },
      useCases: {
        type: "array",
        maxItems: 3,
        items: { type: "string", maxLength: STRICT_LIMITS.useCaseItem },
        description: "Key bullet points / use cases",
      },
      category: { type: "string", maxLength: STRICT_LIMITS.category, description: "Badge category label" },
      callToAction: { type: "string", maxLength: STRICT_LIMITS.callToAction, description: "Bottom badge or link" },
      githubUrl: { type: "string", description: "Source GitHub URL" },
      githubStars: { type: "string", description: "Formatted star count" },
      theme: { type: "string", enum: ["dark-neo", "cyber-slate", "sunset-glow", "emerald-minimal", "pure-light"] },
    },
  });
});

// Validate post endpoint
app.post("/api/validate-post", (req, res) => {
  const postData = req.body;
  const validation = validatePostData(postData);
  const trimmed = enforceLimits(postData);

  res.json({
    isValid: validation.isValid,
    errors: validation.errors,
    lengths: validation.lengths,
    limits: STRICT_LIMITS,
    autoTrimmed: trimmed,
  });
});

// Extract from GitHub URL using Gemini
app.post("/api/extract-github", async (req, res) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) {
      return res.status(400).json({ error: "githubUrl is required in request body" });
    }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      return res.status(400).json({
        error: "Invalid GitHub URL format. Please provide e.g. https://github.com/owner/repo or owner/repo",
      });
    }

    const { owner, repo } = parsed;
    const { readme, repoInfo } = await fetchGitHubReadme(owner, repo);

    const description = repoInfo?.description || "";
    const starsCount = repoInfo?.stargazers_count
      ? repoInfo.stargazers_count >= 1000
        ? `${(repoInfo.stargazers_count / 1000).toFixed(1)}k`
        : String(repoInfo.stargazers_count)
      : "";

    // Prepare context for Gemini
    const truncatedReadme = readme ? readme.slice(0, 8000) : "No README available";

    const ai = getGeminiClient();
    let generatedData = null;

    if (ai) {
      try {
        const prompt = `You are a social media post generator for developer tools and open source projects on Instagram & TikTok.
Extract the core value of this GitHub repository and generate content that STRICTLY conforms to exact character limits.

Repository: ${owner}/${repo}
Repo Description: ${description}
Star Count: ${starsCount}
README Content:
${truncatedReadme}

CRITICAL RULES FOR CHARACTER LIMITS:
- title: The repo/app clean name. Maximum ${STRICT_LIMITS.title} characters. Example: "ActivePieces"
- tagline: Short punchy definition. Maximum ${STRICT_LIMITS.tagline} characters. Example: "Open-source business automation"
- summary: Crisp explanation of what it does. Maximum ${STRICT_LIMITS.summary} characters. Example: "Connect over 200+ SaaS apps with AI workflows without writing custom integration code."
- useCases: Exactly 2 practical bullet points of real use cases. Each item MUST be maximum ${STRICT_LIMITS.useCaseItem} characters. Example: ["Automate GitHub issue notifications to Slack", "Sync Webhook leads to Notion database"]
- category: App domain category badge. Maximum ${STRICT_LIMITS.category} characters. Example: "Workflow Automation"
- callToAction: Short footer callout. Maximum ${STRICT_LIMITS.callToAction} characters. Example: "github.com/${owner}/${repo}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: `App or repo title (max ${STRICT_LIMITS.title} chars)` },
                tagline: { type: Type.STRING, description: `Short tagline (max ${STRICT_LIMITS.tagline} chars)` },
                summary: { type: Type.STRING, description: `What it does in short (max ${STRICT_LIMITS.summary} chars)` },
                useCases: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING, description: `Use case bullet (max ${STRICT_LIMITS.useCaseItem} chars)` },
                  description: "2 concise use cases",
                },
                category: { type: Type.STRING, description: `Category badge (max ${STRICT_LIMITS.category} chars)` },
                callToAction: { type: Type.STRING, description: `Footer CTA (max ${STRICT_LIMITS.callToAction} chars)` },
              },
              required: ["title", "tagline", "summary", "useCases", "category", "callToAction"],
            },
          },
        });

        const rawJson = response.text ? JSON.parse(response.text.trim()) : null;
        if (rawJson) {
          generatedData = rawJson;
        }
      } catch (genErr) {
        console.warn("Gemini generation error, falling back to heuristic parsing:", genErr);
      }
    }

    // Fallback heuristic if Gemini key is missing or model threw
    if (!generatedData) {
      generatedData = {
        title: repo.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        tagline: description ? description.slice(0, STRICT_LIMITS.tagline) : "Open Source Project",
        summary: description || `Open source project by ${owner} for developers.`,
        useCases: [
          "Easy integration with modern tech stacks",
          "Automate and streamline developer workflows",
        ],
        category: repoInfo?.topics?.[0] || "Open Source",
        callToAction: `github.com/${owner}/${repo}`,
      };
    }

    // Attach metadata and strictly enforce boundaries
    generatedData.githubUrl = `https://github.com/${owner}/${repo}`;
    generatedData.githubStars = starsCount;
    generatedData.authorOrOrg = owner;

    const trimmedData = enforceLimits(generatedData);
    const validation = validatePostData(trimmedData);

    return res.json({
      success: true,
      data: trimmedData,
      validation,
      sourceRepo: {
        owner,
        repo,
        description,
        stars: repoInfo?.stargazers_count,
        readmeLength: readme.length,
      },
    });
  } catch (err: any) {
    console.error("Error in extract-github:", err);
    return res.status(500).json({
      error: "Failed to extract repository details",
      details: err?.message || String(err),
    });
  }
});

// Direct Post Generation from prompt or JSON payload (useful for n8n or direct API calls)
app.post("/api/generate-post", async (req, res) => {
  try {
    const payload = req.body;

    // If payload is already a structured post object, validate and enforce limits
    if (payload.title && payload.summary) {
      const enforced = enforceLimits(payload);
      return res.json({
        success: true,
        data: enforced,
        validation: validatePostData(enforced),
      });
    }

    // If payload has prompt or description, run through Gemini
    const userPrompt = payload.prompt || payload.text || payload.description;
    if (!userPrompt) {
      return res.status(400).json({ error: "Provide either a structured post JSON or a 'prompt' string." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API client not configured" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Create a social post card JSON strictly obeying these character limits:
Input description: ${userPrompt}

Limits:
- title: max ${STRICT_LIMITS.title} chars
- tagline: max ${STRICT_LIMITS.tagline} chars
- summary: max ${STRICT_LIMITS.summary} chars
- useCases: 2 items, max ${STRICT_LIMITS.useCaseItem} chars each
- category: max ${STRICT_LIMITS.category} chars
- callToAction: max ${STRICT_LIMITS.callToAction} chars`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            summary: { type: Type.STRING },
            useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING },
            callToAction: { type: Type.STRING },
          },
          required: ["title", "tagline", "summary", "useCases", "category", "callToAction"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const enforced = enforceLimits(parsed);
    return res.json({
      success: true,
      data: enforced,
      validation: validatePostData(enforced),
    });
  } catch (err: any) {
    console.error("Error in generate-post:", err);
    return res.status(500).json({ error: err.message || "Failed to generate post" });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
