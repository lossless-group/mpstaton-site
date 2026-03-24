import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-6xl mx-auto px-6 py-24"> <h1 class="gradient-text mb-4">MP Staton</h1> <p class="text-xl text-muted-foreground max-w-2xl mb-8">
Investor, builder, and writer. Exploring venture, technology, and the systems that connect them.
</p> <div class="flex gap-4"> <a href="/portfolio" class="inline-flex items-center px-5 py-2.5 rounded-md gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
View Portfolio
</a> <a href="/blog" class="inline-flex items-center px-5 py-2.5 rounded-md border border-border text-foreground font-medium hover:bg-muted transition-colors">
Read Blog
</a> </div> </section> <div class="max-w-6xl mx-auto px-6"><hr class="gradient-line"></div> <section class="max-w-6xl mx-auto px-6 py-16"> <h2 class="text-foreground mb-8">Latest Posts</h2> <p class="text-muted-foreground">Posts coming soon. Check back for updates on investing, building, and the evolving tech landscape.</p> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/index.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
