/**
 * wikilinks.ts — where a vault path publishes to, as data.
 *
 * This is the config `scripts/wikilink-rules.ts` said it would eventually
 * become: "the site's `src/config/wikilinks.ts` for the `remarkLosslessWikilinks`
 * resolver — same shape, single source of truth."
 *
 * `@lossless-group/lfm@0.6.0` ships `createPathResolver`, so the site no longer
 * hand-writes the resolution mechanics — normalisation, case- and
 * separator-insensitive matching, template expansion. It supplies destinations
 * and nothing else, which is the only part that is genuinely per-site.
 *
 * ## Faithful to the rules it replaces
 *
 * `slugFrom: 'tail'` reproduces the old `slugifyTail`: strip the matched
 * prefix, slugify what remains, keep the slashes. LFM's `slugifyPath` excludes
 * `/` from the character class for exactly this reason, so `tooling/AI/Foo Bar`
 * still resolves to `.../toolkit/ai/foo-bar` rather than collapsing to a
 * basename.
 *
 * Matching is case- and separator-insensitive by default, which is what the old
 * rules achieved by requiring every `prefix` be authored in lowercase. The
 * requirement is now the library's job.
 *
 * ## No index, deliberately
 *
 * `createPathResolver` also accepts an `index` of vault paths, which is what
 * lets bare `[[Page]]` links resolve by basename. This site has no local copy
 * of the vault to index, and the rules being replaced never resolved bare links
 * either — so omitting it keeps behaviour identical rather than quietly
 * changing what does and does not link. Add `index` here if the vault ever
 * lands locally; nothing else needs to change.
 */
import type { PathResolverConfig } from '@lossless-group/lfm';

export const wikilinkPaths: PathResolverConfig = {
  // Order matters: first match wins, so list more specific prefixes first.
  routes: [
    { match: 'tooling', to: 'https://www.lossless.group/toolkit/{slug}' },

    // Two vault folders, one public index.
    { match: ['vocabulary', 'concepts'], to: 'https://www.lossless.group/more-about/{slug}' },

    { match: 'projects', to: 'https://www.lossless.group/projects/gallery/{slug}' },

    // The only same-site destination — rendered without target="_blank".
    { match: 'essays', to: '/essays/{slug}', isLocal: true },

    { match: 'sources', to: 'https://www.lossless.group/sources/{slug}' },
    { match: 'lost-in-public', to: 'https://www.lossless.group/learn-with/{slug}' },

    /**
     * Parked, not forgotten. These had no public destination under
     * DEFERRED_PREFIXES, and `to: null` says so explicitly: the route CLAIMS
     * the path and resolves it to nothing, so it renders as plain text and is
     * reported as `route-parked` rather than as an unresolved link nobody has
     * looked at. That distinction is the whole point of the old deferred list.
     */
    { match: ['organizations', 'vertical-toolkits'], to: null },
  ],

  // Strip the prefix, slugify the tail, keep the slashes — see above.
  slugFrom: 'tail',
};
