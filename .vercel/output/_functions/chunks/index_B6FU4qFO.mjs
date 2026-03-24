import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Blog - MP Staton", "description": "Thoughts on investing, building, and technology." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-4xl mx-auto px-6 py-16"> <h1 class="text-foreground mb-4">Blog</h1> <p class="text-lg text-muted-foreground mb-12">
Thoughts on investing, building, and the evolving technology landscape.
</p> <div class="space-y-8"> <p class="text-muted-foreground py-12 text-center border border-dashed border-border rounded-lg">
Blog posts coming soon. Content will be driven by Astro content collections.
</p> </div> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/blog/index.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
