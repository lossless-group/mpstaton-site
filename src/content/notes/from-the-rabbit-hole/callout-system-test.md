---
title: "Callout System Test"
lede: "Every supported callout type and alias rendering through the new three-file LFM Callout component, with semantic-token theming over the brand palette."
date_created: 2026-05-08
date_modified: 2026-05-08
authors:
  - Michael Staton
tags: [LFM, Callouts, Test-Page, Markdown-Rendering]
---

This page exercises every callout type and alias supported by `@lossless-group/lfm`'s `remark-callouts` plugin, as rendered by the new `Callout.astro` component. Toggle the theme between light and dark to verify mode-aware accents.

## The ten canonical types

> [!note] Note
> A standard note. Graphite accent — quietest of the family.
>
> Multi-paragraph content should flow naturally with restored prose margins, even though Tailwind preflight zeros them out globally.

> [!info] Info — the brand's hero callout
> The `info` variant is intentionally bigger and brighter. It picks up `--fx-glow-opacity` and `--fx-glow-spread` from `tokens.css`, so the glow is subtle in light mode and full-strength in dark mode.
>
> - Bigger padding
> - Stronger border
> - Edges-that-pop glow

> [!tip] Tip
> Lime accent. In light mode the lime is deepened toward the foreground so it reads on the bone background.
> ![Alta HQ Capabiliities Illustration](https://cdn.prod.website-files.com/631883dcd370766be66dd299/69c2237c9e2fdb4a3024ec7c_1.avif)

> [!success] Success
> The migration finished without errors. Same lime as `tip` but with a check icon.

> [!warning] Warning
> Amber accent. Use sparingly — these are louder than they look.

> [!danger] Danger
> Crimson accent. Reserve for actually-dangerous things, not stylistic emphasis.

> [!quote] Quote
> "The best way to predict the future is to invent it." — Alan Kay
>
> Quote callouts render in italic to preserve the blockquote feel.

> [!example] Example
> A worked example. Violet accent — same family as quote, but with a beaker icon.
>
> ```ts
> const callout = resolveCalloutType('warn'); // → 'warning'
> ```

> [!question] Question
> Aqua accent. Useful for FAQs or open-ended prompts to the reader.

> [!important] Important
> Crimson accent with a bell icon. Stronger than `info`, used for "you must read this" emphasis.

> [!llm-response] LLM Response
> Sparkles icon, brand-purple accent. Used in essays to mark verbatim AI output. Recognized because the regex was broadened from `\w+` to `[\w-]+` — hyphenated type identifiers used to silently fall through as plain blockquotes.

> [!excerpt] Excerpt — long-form quoted copy
> Smaller body font, italic, muted graphite accent. The accent is intentionally quiet so the borrowed material recedes and the surrounding author voice stays foreground.
>
> Excerpts are typically multi-paragraph copypasta from another source. A reduced body font keeps a long block from dominating the page, and italic signals "this is borrowed."
>
> The third paragraph confirms the smaller font carries through across blank-line-separated paragraphs inside the same callout.

## Aliases

These should render as their canonical type (warn → warning, tldr → info, etc.).

> [!warn] Warn (alias for warning)
> Same amber accent and triangle icon as `[!warning]`.

> [!caution] Caution (alias for warning)
> Same as warn.

> [!attention] Attention (alias for warning)
> Same as warn.

> [!fail] Fail (alias for danger)
> Crimson, octagon icon.

> [!failure] Failure (alias for danger)
> Same as fail.

> [!error] Error (alias for danger)
> Same as fail.

> [!bug] Bug (alias for danger)
> Same as fail.

> [!hint] Hint (alias for tip)
> Lime, lightbulb icon.

> [!check] Check (alias for success)
> Lime, check icon.

> [!done] Done (alias for success)
> Same as check.

> [!todo] Todo (alias for note)
> Graphite, pencil icon.

> [!abstract] Abstract (alias for info)
> Hero variant — same glow treatment as `[!info]`.

> [!summary] Summary (alias for info)
> Same as abstract.

> [!tldr] TL;DR (alias for info)
> Same as abstract.

> [!faq] FAQ (alias for question)
> Aqua, question-mark icon.

> [!help] Help (alias for question)
> Same as faq.

## Edge cases

### Unknown type falls back to `note`

> [!banana] Unknown type
> The string `banana` isn't in the registry, so this should fall back to the `note` style and icon — but the header text the author wrote is preserved.

### Empty title (foldable syntax) suppresses the header row

> [!info]-
> No header — the body sits flush next to the icon. Useful when the body is self-explanatory and a label would be redundant.

### Missing title uses the default label

> [!warning]
> No title was supplied, so the default label "Warning" appears in the header.

### Rich content inside callouts

> [!example] Lists, code, and inline formatting
> Callouts can contain **bold**, *italic*, `inline code`, and [links](https://example.com).
>
> 1. First item
> 2. Second item with `code`
> 3. Third item
>
> Bulleted lists work too:
>
> - Alpha
> - Beta
> - Gamma
>
> ```ts
> // Code blocks render with their normal styling
> function greet(name: string) {
>   return `Hello, ${name}!`;
> }
> ```
>
> One last paragraph to confirm trailing margin handling.

## Casing — any case should yield identical rendering

The remark plugin lowercases the bracketed type before matching, and `resolveCalloutType()` lowercases again. So Obsidian-style UPPERCASE, Title Case, and lowercase all resolve to the same canonical type. There is no enforcement of casing.

> [!INFO] Uppercase INFO
> Should render identically to `[!info]` — full hero variant with glow.

> [!Warning] Title Case Warning
> Should render identically to `[!warning]`.

> [!TIP] Uppercase TIP
> Same as `[!tip]`.

> [!ALERT] Uppercase ALERT (alias for warning)
> Should render as a warning. ALERT is a fullstack-vc convention; aliased here.

> [!IDEA] Uppercase IDEA (alias for tip)
> Should render as a tip with the lightbulb icon.

## Done

If every block above renders with a distinct accent color, the matching icon, and the right header text — and if toggling the theme switcher recolors them all without breaking contrast — the integration is working.
