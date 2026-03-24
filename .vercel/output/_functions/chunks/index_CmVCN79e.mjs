import { c as createComponent } from './astro-component_BNkzlXSz.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CdGC3uGO.mjs';
import { $ as $$BaseLayout } from './BaseLayout_CUSg4_P1.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Posts - MP Staton", "description": "Curated posts and links on technology, venture, and systems thinking." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-4xl mx-auto px-6 py-16"> <h1 class="text-foreground mb-4">Posts</h1> <p class="text-lg text-muted-foreground mb-12">
A curated aggregation of posts, links, and commentary from across the web.
</p> <div class="space-y-8"> <p class="text-muted-foreground py-12 text-center border border-dashed border-border rounded-lg">
Post aggregation coming soon. This will pull from various sources and feeds.
</p> </div> </section> ` })}`;
}, "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/posts/index.astro", void 0);

const $$file = "/Users/mpstaton/code/lossless-monorepo/astro-knots/sites/mpstaton-site/src/pages/posts/index.astro";
const $$url = "/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
