import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$Logos = createComponent(($$result, $$props, $$slots) => {
  const logos = [
    {
      name: "v1 — Terminal",
      file: "/trademarks/logo-v1-terminal.svg",
      description: 'Monospace with animated blinking cursor. The "o" is highlighted in blue.',
      font: "JetBrains Mono"
    },
    {
      name: "v2 — Shell Prompt",
      file: "/trademarks/logo-v2-prompt.svg",
      description: 'Shell prompt style: ~/mpstaton $ with cursor. "mp" dimmed, name in blue.',
      font: "Fira Code"
    },
    {
      name: "v3 — Bracket",
      file: "/trademarks/logo-v3-bracket.svg",
      description: "Code object style with amber curly braces framing the name.",
      font: "JetBrains Mono"
    },
    {
      name: "v4 — Underscore",
      file: "/trademarks/logo-v4-underscore.svg",
      description: "Variable-name convention: mp_staton. Underscore highlighted in amber.",
      font: "Fira Code"
    },
    {
      name: "v5 — JSX Tag",
      file: "/trademarks/logo-v5-tag.svg",
      description: "Self-closing JSX/HTML tag: <mpstaton />. Angle brackets in muted gray.",
      font: "JetBrains Mono"
    }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Logo Variants - Design System - MP Staton" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-6xl mx-auto px-6 py-16"> <div class="mb-12"> <a href="/design-system" class="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Design System</a> <h1 class="text-foreground mt-4 mb-2">Logo Variants</h1> <p class="text-lg text-muted-foreground max-w-2xl">
Explorations for the mpstaton brand mark. All use nerd-friendly monospace fonts, lowercase, with subtle modifications.
</p> </div> <div class="space-y-12"> ${logos.map((logo) => renderTemplate`<div class="rounded-lg border border-border overflow-hidden"> <!-- Dark preview --> <div class="bg-[#0f172a] p-10 flex items-center justify-center min-h-[120px]"> <img${addAttribute(logo.file, "src")}${addAttribute(logo.name, "alt")} class="max-h-[48px] w-auto"> </div> <!-- Light preview --> <div class="bg-[#f1f5f9] p-10 flex items-center justify-center min-h-[120px]"> <img${addAttribute(logo.file, "src")}${addAttribute(`${logo.name} on light`, "alt")} class="max-h-[48px] w-auto invert"> </div> <!-- Info --> <div class="bg-card p-6 border-t border-border"> <div class="flex items-start justify-between gap-4"> <div> <h3 class="text-card-foreground font-semibold mb-1">${logo.name}</h3> <p class="text-sm text-muted-foreground">${logo.description}</p> </div> <div class="text-right shrink-0"> <span class="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">${logo.font}</span> </div> </div> <div class="mt-3 flex gap-3"> <a${addAttribute(logo.file, "href")} target="_blank" class="text-xs text-primary hover:underline">Open SVG &rarr;</a> <span class="text-xs text-muted-foreground font-mono">${logo.file}</span> </div> </div> </div>`)} </div> <!-- Favicon --> <div class="mt-16"> <h2 class="text-foreground mb-6">Favicon</h2> <div class="rounded-lg border border-border overflow-hidden inline-block"> <div class="bg-[#0f172a] p-8 flex items-center justify-center"> <img src="/favicon.svg" alt="Favicon" class="w-16 h-16"> </div> <div class="bg-card p-4 border-t border-border"> <p class="text-sm text-muted-foreground font-mono">/favicon.svg</p> </div> </div> </div> <!-- Usage notes --> <div class="mt-16 rounded-lg border border-border bg-muted/50 p-6"> <h3 class="text-foreground font-semibold mb-3">Usage Notes</h3> <ul class="space-y-2 text-sm text-muted-foreground"> <li>All SVGs import Google Fonts (JetBrains Mono / Fira Code) — ensure network access or self-host for production.</li> <li>Dark-mode-first palette: primary text is <code class="bg-muted px-1 rounded">#f1f5f9</code> (slate-100), accent is <code class="bg-muted px-1 rounded">#f59e0b</code> (amber-500).</li> <li>The light preview uses CSS <code class="bg-muted px-1 rounded">invert</code> as a quick approximation — dedicated light variants should be created for production.</li> <li>v1-terminal has an animated cursor blink (CSS animation inside the SVG).</li> </ul> </div> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/design-system/logos.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/design-system/logos.astro";
const $$url = "/design-system/logos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
