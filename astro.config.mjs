import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import vercel from '@astrojs/vercel'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'

// Detect if we're in the monorepo with local workspace packages available.
const workspaceRootUrl = new URL('../../..', import.meta.url)
const workspacePackagesUrl = new URL('../../packages', import.meta.url)
const tokensCssUrl = new URL('../../packages/tokens/css', import.meta.url)
const brandConfigSrcUrl = new URL('../../packages/brand-config/src', import.meta.url)
const hasWorkspaceTokensCss = existsSync(fileURLToPath(tokensCssUrl))
const hasWorkspaceBrandConfig = existsSync(fileURLToPath(brandConfigSrcUrl))

// Watch raw-fs content (the /promote tree, loaded via readFileSync, not through
// Astro's content layer) and push a full-reload to the browser when it changes.
// Without this, edits to memos / opportunity.yaml / variants.yaml require a manual
// browser refresh to surface — server output re-reads on every request, but Vite
// has no module-graph reason to ping the WS.
const watchRawContent = {
  name: 'watch-raw-content',
  apply: 'serve',
  configureServer(server) {
    const handler = (file) => {
      if (file.includes('/src/content/promote/')) {
        server.ws.send({ type: 'full-reload', path: '*' });
      }
    };
    server.watcher.on('change', handler);
    server.watcher.on('add', handler);
    server.watcher.on('unlink', handler);
  },
};

// Build aliases conditionally so standalone deployments don't depend on monorepo paths.
const aliases = {
  '@brand': fileURLToPath(new URL('./src/config/brand.ts', import.meta.url)),
  ...(hasWorkspaceTokensCss
    ? { '@knots/tokens/css': fileURLToPath(tokensCssUrl) }
    : {}),
  ...(hasWorkspaceBrandConfig
    ? { '@knots/brand-config': fileURLToPath(brandConfigSrcUrl) }
    : {})
}

export default defineConfig({
  site: 'https://mpstaton.com',
  output: 'server',
  adapter: vercel(),
  // The dev-only toolbar overlays the bottom-centre of every page and sits
  // above the site's own chrome, which puts it on top of anything anchored
  // there — the playlist panel's controls among them — and makes it the hit
  // target for clicks aimed underneath it.
  devToolbar: {
    enabled: false,
  },
  markdown: {
    shikiConfig: {
      // Shiki language ids are lowercase and case-sensitive, so a ```R fence
      // misses the bundled `r` grammar and falls back to plaintext with a
      // build warning. R is the language whose community actually capitalises
      // its name, so the fence is written the way an R author would write it
      // and the alias meets them there rather than rewriting their prose.
      langAlias: {
        R: 'r',
      },
    },
  },
  integrations: [
    svelte(),
    // @astrojs/sitemap auto-generates sitemap-index.xml + sitemap-0.xml from
    // every prerendered page Astro emits. Filter excludes the llms.txt
    // endpoints (those serve LLMs, not search engines) and the 404 page.
    sitemap({
      filter: (page) =>
        !page.includes('/llms.txt') &&
        !page.includes('/llms-full.txt') &&
        !page.endsWith('/404/') &&
        !page.endsWith('/404'),
    }),
  ],
  vite: {
    plugins: [tailwind(), watchRawContent],
    server: hasWorkspaceTokensCss
      ? {
          fs: {
            allow: [
              fileURLToPath(workspaceRootUrl),
              fileURLToPath(workspacePackagesUrl)
            ]
          }
        }
      : undefined,
    resolve: {
      alias: aliases
    }
  }
})
