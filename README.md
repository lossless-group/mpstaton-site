# Michael P. Staton — Personal Site

<p align="center">
  <span style="font-size: 18px; font-weight: 500; color: #374151;">A personal site, portfolio, and writing surface built with</span>
  <span style="font-size: 20px; color: #ef4444; margin: 0 4px;">❤️</span>
  <span style="font-size: 18px; font-weight: 500; color: #374151;">by</span>
  <br/>
  <a href="https://lossless.group" target="_blank" rel="noopener" style="text-decoration: none; display: inline-flex; align-items: center; margin: 8px 0;">
    <img src="https://ik.imagekit.io/xvpgfijuw/uploads/lossless/trademarks/trademark__The-Lossless-Group.svg?updatedAt=1758016855404" alt="The Lossless Group" height="24" style="margin-right: 8px;" />
    <span style="font-size: 22px; font-weight: 600; color: #1f2937;">The Lossless Group</span>
  </a>
  <br/>
  <span style="font-size: 14px; color: #6b7280; margin-top: 12px; display: block;">
    SSR + content-driven with
    <a href="https://astro.build" style="color: #7c3aed; text-decoration: none; font-weight: 500;">Astro 6</a>,
    <a href="https://tailwindcss.com" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Tailwind CSS v4</a>, and
    <a href="https://jsr.io/@lossless-group/lfm" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">@lossless-group/lfm</a>
  </span>
</p>

## Table of Contents

- [Stack](#stack)
- [What this site does](#what-this-site-does)
- [Content Authoring and Management](#content-authoring-and-management)
  - [📝 Markdown rendering through @lossless-group/lfm](#-markdown-rendering-through-lossless-grouplfm)
  - [📄 Context-V documents](#-context-v-documents)
  - [📚 Essays](#-essays)
  - [🐰 Notes from the rabbit hole](#-notes-from-the-rabbit-hole)
  - [🎯 The /promote surface — gated investment opportunities](#-the-promote-surface--gated-investment-opportunities)
  - [📜 Changelog](#-changelog)
- [LFM Dev Mode](#lfm-dev-mode)
- [Site Development and Specifications](#site-development-and-specifications)
  - [✅ Implementation Status](#-implementation-status)
  - [📦 Major Dependencies](#-major-dependencies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

***

# Stack

<p align="center">
  <a href="https://astro.build" target="_blank" rel="noopener">
    <img src="https://astro.build/assets/press/astro-logo-light-gradient.png" alt="Astro" height="48" />
  </a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://tailwindcss.com" target="_blank" rel="noopener">
    <img src="https://ik.imagekit.io/xvpgfijuw/uploads/lossless/trademarks/trademark__TailwindCSS--Lighter.webp?updatedAt=1758016076289" height="42" />
  </a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://jsr.io/@lossless-group/lfm" target="_blank" rel="noopener">
    <strong>@lossless-group/lfm</strong>
  </a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://vercel.com" target="_blank" rel="noopener">
    <strong>Vercel adapter (server output)</strong>
  </a>
</p>

<p align="center">
  Modern site generation with shared markdown rendering, citations, mermaid diagrams, and bare-URL auto-unfurl — all flowing through one MDAST pipeline.
</p>

***

# What this site does

This is Michael Staton's personal site. It carries:

- A short **portfolio** and **CV** at `/portfolio` and `/cv`.
- **Long-form writing**: essays, posts, and notes — all consumed through `@lossless-group/lfm` so authoring lives in plain markdown with rich rendering.
- A **Context-Vigilance** document surface at `/context-vigilance/` that fetches specs, blueprints, prompts, and reminders from the parent `astro-knots` GitHub repo at build time.
- A gated **`/promote`** surface for sharing investment-opportunity decks and memos with a small circle of co-investors. Polite access gate, multi-format decks, version-pinned memos, and a hub-per-opportunity.
- **Dynamic OpenGraph image generation** at `/api/og` — Satori → SVG → resvg-js → PNG, so every shared link unfurls with a brand-styled card.

***

# Content Authoring and Management

## 📝 Markdown rendering through `@lossless-group/lfm`

All long-form content (essays, notes, context-v docs, promote memos) is plain markdown rendered through the shared LFM pipeline. Authoring features supported today:

- **Standard CommonMark + GFM** — tables (alignment), strikethrough, task lists, footnotes, autolinks.
- **Hex-code citations** — `[^a1b2c3]` references with `[^a1b2c3]: 2025. [Title](URL). Published: YYYY-MM-DD` definitions get renumbered to display indices `[1]`, `[2]`, … and a Sources section renders at the bottom of the article. The hex code anchors the link from the inline citation marker to its source-list entry.
- **Obsidian-style callouts** — `> [!note] Title` blocks normalize to LFM directives and render as `Callout` components.
- **Image directives** — `:::image{src caption credit alt}` for rich metadata on inline images.
- **Mermaid diagrams** — fenced ` ```mermaid ` blocks render via the CDN-loaded `mermaid@10` ESM module with theme-token parity. An expand-to-modal affordance handles complex diagrams. See changelog `2026-05-03_02.md`.
- **Bare URL auto-unfurl** — paste a YouTube / YouTube Short / YouTube Playlist URL on its own line and it embeds with the right aspect ratio and a copy-URL button. See changelog `2026-05-03_03.md`. Inline links stay autolinks.

```markdown
content line content line

https://youtu.be/jCe2wg1ulus?si=oplqTdsbv8sv2JfH

content line content line
```

The renderer (`src/components/markdown/AstroMarkdown.astro`) walks the MDAST tree from `parseMarkdown(entry.body)` and dispatches each node type — headings, paragraphs, code blocks (with a Mermaid branch), bare-URL paragraphs (with a YouTube branch), images, callouts, citations — to the appropriate component.

## 📄 Context-V documents

The `/context-vigilance/` route renders the specs / blueprints / prompts / reminders authored in the parent `astro-knots` repo's `context-v/` directory. Documents are fetched at build time by `scripts/fetch-context-v.ts`:

- The script reads the repo list from `context-v-sources.yaml` at the site root.
- For each source repo, it pulls the `context-v/` tree via the GitHub API, filters to `.md` files in configured categories (`specs`, `blueprints`, `prompts`, `reminders`), and writes them under `src/content/context-v/{repo-slug}/{category}/`.
- Frontmatter is enriched with a `_context_v` provenance block (repo, branch, commit, file path, GitHub URL).
- Caching is by tree SHA — unchanged repos skip the per-file fetch.

To add a new source repo, edit `context-v-sources.yaml` and run `pnpm fetch-context`.

## 📚 Essays

Essays live in a shared content repo (`lossless-group/lossless-content/essays/`) and are pulled at build time by `scripts/fetch-essays.ts`. Each essay is a markdown file with portrait/banner images and rich frontmatter.

## 🐰 Notes from the rabbit hole

`src/content/notes/from-the-rabbit-hole/` — short notes co-located with the site. Editorial cadence is faster than essays; the rendering pipeline is identical (LFM → AstroMarkdown).

## 🎯 The `/promote` surface — gated investment opportunities

A multi-tenant opportunity-promotion surface for sharing investment opportunities with a small circle of co-investors. Three-surface architecture:

1. **Public index** at `/promote` — listed opportunities with status pills (Active / Closing soon / Paused / Closed).
2. **Gated opportunity hub** at `/promote/{slug}` — materials chooser (memo, deck variants).
3. **Gated materials** at `/promote/{slug}/{type}/{format?}/{version?}` — the actual deck or memo content.

A polite access gate (signed cookie, scrypt-hashed master code, optional per-opportunity overrides) protects every gated path. See `astro-knots/context-v/blueprints/Build-a-Promotion-Surface-for-Investment-Opportunities.md` for the full architecture and changelog `2026-05-03_01.md` for the implementation summary.

Each opportunity is a directory at `src/content/promote/{slug}/`:

```
src/content/promote/{slug}/
├── opportunity.yaml     # metadata: company, status, materials list, gate config
├── variants.yaml        # registry of (format, version) deck pairs
├── data.yaml            # shared structured data the deck composes against
├── narratives/          # one .md per slide (frontmatter + prose)
└── memo/v{N}.md         # versioned memo content
```

**Privacy convention** (this is a public repo): real opportunity slugs are gitignored under `src/content/promote/`, `src/layouts/sections/promote/`, and `public/promote/`. Directories prefixed with `_` (e.g., `_demo`, `_template`) are committed as scaffolding seeds. See the `.gitignore` in this directory.

## 📜 Changelog

Site-level changelog lives at `changelog/{YYYY-MM-DD}_{NN}.md` — the repo root, matching the tree-wide Lossless convention. Each entry is a full markdown post: feature name + body, with diagrams allowed.

Entries surface through `/llms.txt` and `/llms-full.txt`, and the same directory is what the Lossless corpus ingester reads. There are no per-entry changelog pages on this site today.

***

# LFM Dev Mode

When developing LFM features against this site, the standard `@lossless-group/lfm` dependency points at the JSR-published version. To pick up unreleased LFM changes from `packages/lfm/` in the parent monorepo, switch the site to "local" mode:

```bash
# Switch to workspace LFM (use only on a `development` branch)
pnpm lfm:local

# Switch back to JSR (use before merging to main)
pnpm lfm:jsr

# Auto-detect from the current git branch (development/develop/dev → local; else JSR)
pnpm lfm:auto
```

Behind the scenes the script flips `package.json`'s LFM specifier between `npm:@jsr/lossless-group__lfm@^0.2.1` and `workspace:^`, toggles `.npmrc`'s `ignore-workspace` flag, and regenerates `pnpm-lock.yaml` with the right `--ignore-workspace` semantics. **Never commit a workspace-mode `package.json` or lockfile to a deployable branch** — Vercel can't resolve workspace links from the standalone site repo. Full convention in `astro-knots/context-v/blueprints/Maintain-Branch-Aware-LFM-Dev-Mode.md`.

***

# Site Development and Specifications

## ✅ Implementation Status

### Markdown render pipeline (current)
- [x] **Standard markdown + GFM** — tables, strikethrough, footnotes, autolinks
- [x] **Hex-code citations** — inline renumbering + Sources component
- [x] **Obsidian callouts** — `> [!type] Title` directive normalization
- [x] **Image directives** — caption / credit / alt with rich metadata
- [x] **Mermaid diagrams** — CDN runtime, theme parity, expand-to-modal
- [x] **Bare URL auto-unfurl** — YouTube watch / Shorts / Playlists
- [ ] **Vimeo / Loom / Spotify / SoundCloud auto-unfurl** — planned in catalog
- [ ] **Inline link previews** — `LinkPreview__*--Row/Card/Thumb` family
- [ ] **Wikilinks + backlinks**
- [ ] **Highlights (`==text==`) and inline tags (`#Tag-Name`)**

### `/promote` surface
- [x] **Polite access gate** — signed cookie, scrypt-hashed master code, per-opportunity overrides
- [x] **Materials chooser** — 0/1/2-3/4+ rendering branches
- [x] **Scroll-deck rendering** — copy of the calmstorm-decks pattern, adapted to mpstaton-site tokens
- [x] **Versioned memos** — `memo/v{N}.md` with `version-{N}` URL grammar
- [x] **OpenGraph + Twitter card meta** — DMs unfurl with brand image and headline
- [x] **Demo opportunity (`_demo`)** — end-to-end smoke test scaffold

### Content fetchers
- [x] **Context-V GitHub fetcher** — pulls docs from configured repos, caches by tree SHA, enriches with provenance
- [x] **Essays fetcher** — pulls essays from `lossless-group/lossless-content` at build

### OpenGraph
- [x] **Dynamic OG image generation** — Satori + resvg-js, branded templates per page type

## 📦 Major Dependencies

### Runtime
- **Astro** — v6.0.8 — server-output mode via `@astrojs/vercel` adapter
- **Tailwind CSS** — v4.1.14 — `@tailwindcss/vite` plugin, semantic-token CSS architecture
- **@lossless-group/lfm** — `npm:@jsr/lossless-group__lfm@^0.2.2` — shared markdown pipeline (JSR canonical)
- **Satori** — v0.26.0 — JSX → SVG for OG image generation
- **@resvg/resvg-js** — v2.6.2 — SVG → PNG rasterization
- **mdast-util-to-string** — v4.0.0 — heading-ID generation in the renderer
- **yaml** — v2.8.3 — YAML parsing for opportunity / variants / data files
- **mermaid** — v10 (CDN, runtime-loaded) — diagram rendering

### Tooling
- **pnpm** — v10+ — workspace-aware package manager (always use pnpm; never npm/yarn)
- **Bun** — used for the build-time fetcher scripts (`bun scripts/fetch-*.ts`)

***

# Project Structure

```
mpstaton-site/
├── src/
│   ├── components/
│   │   ├── markdown/         # AstroMarkdown, Callout, CodeBlock, MermaidChartDisplay,
│   │   │                     # MarkdownImage, Sources, YouTubeEmbed/Shorts/Playlist
│   │   └── promote/          # OpportunityCard, MaterialsChooser, StatusPill, etc.
│   ├── content/
│   │   ├── changelog/        # site-level change history
│   │   ├── essays/           # FETCHED — see scripts/fetch-essays.ts
│   │   ├── context-v/        # FETCHED — see scripts/fetch-context-v.ts
│   │   ├── notes/            # local notes from the rabbit hole
│   │   ├── promote/          # opportunity content (gitignored except _-prefixed seeds)
│   │   └── content.config.ts # collection schemas (Zod)
│   ├── lib/
│   │   ├── markdown/         # classify-bare-link.ts (renderer-side, mirrors LFM catalog)
│   │   └── promote/          # opportunities, memos, sections, urls (server-side loaders)
│   ├── pages/
│   │   ├── api/og.ts         # dynamic OG image generation
│   │   ├── context-vigilance/# context-v document index + detail
│   │   ├── essays/           # essays index + detail
│   │   ├── notes/            # notes index + detail
│   │   ├── promote/          # /promote surface (index + [slug]/memo + [slug]/deck)
│   │   ├── portfolio/        # portfolio
│   │   ├── about.astro       # about
│   │   ├── cv.astro          # CV
│   │   └── index.astro       # homepage
│   ├── styles/               # tokens.css (semantic + brand vars), globals, prose
│   └── middleware.ts         # /promote gate cookie validation
├── scripts/
│   ├── fetch-context-v.ts    # build-time context-v document fetcher
│   ├── fetch-essays.ts       # build-time essays fetcher
│   └── lfm-mode.mjs          # local ↔ JSR LFM swap (see "LFM Dev Mode" above)
├── public/                   # static assets (favicon, photos, share banners)
├── astro.config.mjs
├── package.json
└── README.md                 # this file
```

***

# Getting Started

## Prerequisites

- Node.js (v18 or later)
- **pnpm** v10+ (`npm i -g pnpm`)
- **bun** (for build-time fetcher scripts) — `curl -fsSL https://bun.sh/install | bash`
- A GitHub Personal Access Token in `GITHUB_CONTENT_PAT` (only needed if you exceed the unauthenticated 60/hr rate limit while fetching context-v / essays)

## Installation

```bash
cd sites/mpstaton-site
pnpm install --ignore-workspace
```

The `--ignore-workspace` flag is critical — it makes pnpm treat this site as standalone (matching Vercel's deploy environment) rather than substituting workspace packages. The site's `.npmrc` already has `ignore-workspace=true` so subsequent installs honor it automatically.

## Local environment

Copy `.env.example` to `.env` and fill in:

```bash
GITHUB_CONTENT_PAT=ghp_...               # optional — only for higher fetch rate limits
PROMOTE_SESSION_SECRET=...               # 32-byte hex; HMAC signing key for /promote cookie
PROMOTE_MASTER_CODE_HASH=...             # scrypt of the master access code
PROMOTE_OVERRIDE_CODES_JSON={"slug":"..."}  # optional per-opportunity override map
PROMOTE_DEV_BYPASS=1                     # local convenience — accepts any code
```

## Development

```bash
pnpm dev
```

Site available at `http://localhost:4321`. The `dev` script runs both fetchers first, so the first start may take a few seconds while context-v and essays sync from GitHub.

***

# Available Scripts

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies (with `--ignore-workspace` if not in `.npmrc`) |
| `pnpm dev` | Fetch content, then start the dev server |
| `pnpm build` | Fetch content, then build for production (Vercel server output) |
| `pnpm preview` | Preview the production build locally |
| `pnpm fetch-all` | Run both fetchers (context-v + essays) without starting the server |
| `pnpm fetch-context` | Just the context-v fetcher |
| `pnpm fetch-essays` | Just the essays fetcher |
| `pnpm lfm:auto` | Swap LFM mode based on git branch (development → local, else JSR) |
| `pnpm lfm:local` | Force LFM to the workspace package (development branches only) |
| `pnpm lfm:jsr` | Force LFM to JSR (always before merging to a deployable branch) |
| `pnpm astro ...` | Run Astro CLI commands directly |

***

# Deployment

The site deploys to **Vercel** as a server-output Astro app via `@astrojs/vercel`. Vercel watches this site's repo (the submodule) directly — not the parent `astro-knots` monorepo — so this site must be self-contained and never depend on workspace packages on a deployable branch.

```bash
pnpm build
```

Verifies cleanly with:
```bash
pnpm install --frozen-lockfile --ignore-workspace --lockfile-only
```
That's exactly what Vercel runs. If it passes locally, Vercel will pass.

## Configuration files

- **`astro.config.mjs`** — Vercel adapter, Tailwind v4 Vite plugin, server output
- **`.npmrc`** — `ignore-workspace=true`, `@jsr:registry=https://npm.jsr.io`, JSR-aliased LFM
- **`pnpm-workspace.yaml`** (parent) — site is a workspace member for development convenience only; production install ignores the workspace
- **`tsconfig.json`** — extends `astro/tsconfigs/strict`, alias `@brand` → `src/config/brand.ts`

***

# Documentation

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS v4](https://tailwindcss.com)
- [@lossless-group/lfm on JSR](https://jsr.io/@lossless-group/lfm)
- Parent monorepo: `astro-knots/CLAUDE.md` (philosophy + cross-site patterns)
- Markdown features spec: `astro-knots/context-v/specs/Codifying-a-Comprehensive-Extended-Markdown-Flavor-and-Shared-Package.md`
- Branch-aware LFM dev: `astro-knots/context-v/blueprints/Maintain-Branch-Aware-LFM-Dev-Mode.md`
- Promote surface: `astro-knots/context-v/blueprints/Build-a-Promotion-Surface-for-Investment-Opportunities.md`

---

Built by [The Lossless Group](https://lossless.group) with ❤️ using Astro

<a href="https://lossless.group" target="_blank" rel="noopener" style="text-decoration: none; display: inline-flex; align-items: center; margin: 8px 0;">
  <img src="https://ik.imagekit.io/xvpgfijuw/uploads/lossless/trademarks/bannerImage__The-Lossless-Group.png?updatedAt=1758016899338" alt="The Lossless Group" width="100%" style="margin-right: 8px;" />
</a>
