import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "About - MP Staton", "description": "About MP Staton." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-4xl mx-auto px-6 py-16"> <h1 class="text-foreground mb-4">About</h1> <div class="prose prose-lg max-w-none text-foreground"> <p class="text-muted-foreground">
Bio and background coming soon.
</p> </div> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/about.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
