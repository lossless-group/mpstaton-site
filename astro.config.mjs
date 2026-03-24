import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import vercel from '@astrojs/vercel'

// Detect if we're in the monorepo with local workspace packages available.
const workspaceRootUrl = new URL('../../..', import.meta.url)
const workspacePackagesUrl = new URL('../../packages', import.meta.url)
const tokensCssUrl = new URL('../../packages/tokens/css', import.meta.url)
const brandConfigSrcUrl = new URL('../../packages/brand-config/src', import.meta.url)
const hasWorkspaceTokensCss = existsSync(fileURLToPath(tokensCssUrl))
const hasWorkspaceBrandConfig = existsSync(fileURLToPath(brandConfigSrcUrl))

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
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwind()],
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
