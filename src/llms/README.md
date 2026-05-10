# Source of truth: human-editable prose for the llms.txt endpoints

These markdown files are read at build time by the endpoints in
`src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts`. The endpoints are
deliberately dumb — they do token substitution and append the dynamic
corpus content. **All voice, framing, and structural prose lives here, not
in TypeScript.**

If you want to tweak the wording on `/llms.txt` or `/llms-full.txt`, edit
the corresponding `.md` file in this directory and rebuild. No code changes.

## Files

- `llms.md` — template for `/llms.txt` (the link index).
- `llms-full.md` — template for `/llms-full.txt` (the concatenated full content).

## Tokens (substituted at build time)

| Token | Replaced with |
|---|---|
| `{{SITE_NAME}}` | `SITE_SEO.siteName` from `src/config/seo.ts` (currently "Michael P. Staton") |
| `{{ESSAY_COUNT}}` | Number of entries in the `essays` collection |
| `{{NOTE_COUNT}}` | Number of entries in the `notes` collection (notes from the rabbit hole) |
| `{{CONTEXTV_COUNT}}` | Number of entries in the `context-v` collection |
| `{{CHANGELOG_COUNT}}` | Number of entries in the `changelog` collection |
| `{{REPO_COUNT}}` | Number of distinct source repos across the `context-v` collection (derived from `_context_v.repo_label` with a fallback) |
| `{{LLMS_FULL_URL}}` | Absolute URL to `/llms-full.txt` |
| `{{LLMS_INDEX_URL}}` | Absolute URL to `/llms.txt` |
| `{{ESSAYS_INDEX}}` | Generated link list of essays, sorted by date_modified desc, then title alpha (used in `llms.md`) |
| `{{NOTES_INDEX}}` | Generated link list of notes, sorted by date_modified desc, then title alpha (used in `llms.md`) |
| `{{CONTEXTV_INDEX}}` | Generated link list of context-v entries, grouped by repo_label, alphabetical (used in `llms.md`) |
| `{{CHANGELOG_INDEX}}` | Generated link list of changelog entries, sorted by date desc (used in `llms.md`) |
| `{{CORPUS_BODIES}}` | Concatenation of essays + notes + context-v + changelog raw bodies with metadata headers (used in `llms-full.md`) |

Tokens are simple `{{NAME}}` placeholders — no Mustache, no Handlebars, no
templating engine. If a token is missing in the markdown, the endpoint emits
the file without it. If you add a new dynamic value, register it in the
endpoint's substitution map and document it here.

## Why a separate directory and not `src/lib/` or `src/content/`?

`src/lib/` is for code (TypeScript). `src/content/` is for Astro content
collections, which expect specific schemas and Astro-managed loaders. These
files are neither — they're prose templates that the build step reads as raw
strings via Vite's `?raw` import. Giving them their own directory keeps the
purpose obvious and makes the source-of-truth boundary easy to find.

## URL patterns and the publish/private gate

The endpoints emit canonical URLs that match the rendered HTML page templates:

- Essays: `/essays/${id}/` — from `src/pages/essays/[...slug].astro`
- Notes: `/notes/from-the-rabbit-hole/${id}/` — from `src/pages/notes/from-the-rabbit-hole/[...slug].astro`
- Context-V: `/context-vigilance/${id}/` — from `src/pages/context-vigilance/[...slug].astro`
- Changelog: no rendered detail pages today; entries listed without per-entry URLs

The page templates today **do not filter** entries — every entry in each
collection renders. The endpoints apply
`e.data.publish !== false && e.data.private !== true` as a defensive gate so
that if someone adds a draft frontmatter field later, drafts will be
excluded from the LLM-facing output before the page templates pick up the
gate.

## Server output (Vercel) and prerender

This site is `output: 'server'` (Vercel adapter). The llms.txt endpoints
declare `export const prerender = true` so Astro emits them as static files
at build time rather than evaluating per request. That keeps the multi-MB
`/llms-full.txt` off the request hot path.
