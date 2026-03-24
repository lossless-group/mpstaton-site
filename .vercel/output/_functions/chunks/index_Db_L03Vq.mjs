import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const pages = [
    { title: "Logo Variants", href: "/design-system/logos", description: "All logo concepts and trademark options for mpstaton brand." },
    { title: "Theme & Tokens", href: "/design-system/theme", description: "Color palette, typography, spacing, and dark/light mode tokens." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Design System - MP Staton" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-6xl mx-auto px-6 py-16"> <h1 class="text-foreground mb-2">Design System</h1> <p class="text-lg text-muted-foreground mb-12">Component library, brand assets, and theme reference for mpstaton-site.</p> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> ${pages.map((page) => renderTemplate`<a${addAttribute(page.href, "href")} class="group rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-all hover:-translate-y-0.5"> <h3 class="text-card-foreground font-semibold mb-2 group-hover:text-primary transition-colors"> ${page.title} <span class="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span> </h3> <p class="text-sm text-muted-foreground">${page.description}</p> </a>`)} </div> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/design-system/index.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/design-system/index.astro";
const $$url = "/design-system";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
