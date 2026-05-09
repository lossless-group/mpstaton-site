/**
 * remark-lossless-wikilinks-local.ts — site-local MDAST plugin for v0.5.x.
 *
 * Walks every `text` node in the MDAST and replaces Obsidian wikilinks
 * (`[[Page]]`, `[[Page|Display]]`, `[[Page#Section|Display]]`) with
 * standard `link` MDAST nodes whose URL comes from `resolvePath` in
 * `scripts/wikilink-rules.ts`. Unresolved wikilinks render as plain
 * text (display text only — no anchor) per the operating principle in
 * `[[Wikilink-Resolution-System]]`.
 *
 * **Why an MDAST plugin and not a string preprocessor:** the previous
 * preprocessor approach ran a regex on the raw markdown string, which
 * meant it would transform wikilinks inside code fences and inline code.
 * Visiting only `text` MDAST nodes skips `code`, `inlineCode`, and `html`
 * nodes naturally — wikilinks documented inside code examples stay intact.
 * Same approach as `lossless-monorepo/site/src/utils/markdown/remark-backlinks.ts`
 * (the prior-art reference).
 *
 * **Site-local lifecycle:** this file is a v0.5.x stopgap. Phase 1 of
 * `[[Wikilink-Resolution-System]]` ships the same plugin in the
 * `@lossless-group/lfm` package as `remarkLosslessWikilinks`. When that
 * lands, this file goes away and page templates import from `lfm` instead.
 * The MDAST output shape (standard `link` nodes with `data.hProperties`)
 * is identical so the migration is import-only.
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Parent } from 'mdast';
import type { Plugin } from 'unified';
import { resolvePath, isDeferred } from '../../scripts/wikilink-rules';

// Group 1: path. Group 2: optional #anchor. Group 3: optional |display.
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

function slugifyAnchor(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Default display text — last `/`-separated segment, with `.md` stripped
 *  and hyphens turned to spaces. Original casing preserved. */
function lastSegment(path: string): string {
  const idx = path.lastIndexOf('/');
  const seg = idx === -1 ? path : path.slice(idx + 1);
  return seg.replace(/\.md$/i, '').replace(/-/g, ' ');
}

export interface WikilinkPluginStats {
  resolved: number;
  unresolved: string[];   // lowercased paths
  deferred: number;
}

/**
 * Canonical unified plugin shape: the exported function IS the attacher.
 * Call site:
 *   processor.use(remarkLosslessWikilinksLocal, stats)
 * NOT:
 *   processor.use(remarkLosslessWikilinksLocal(stats))   // wrong — bypasses unified
 *
 * Wrapping the factory in `(stats) => transformer` and passing the result
 * to `.use()` skips unified's attacher invocation and the transformer
 * gets called with no tree argument. That manifests as
 * "TypeError: node is not an Object" inside unist-util-visit.
 */
export const remarkLosslessWikilinksLocal: Plugin<[WikilinkPluginStats?], Root> = function (stats) {
  const counter: WikilinkPluginStats = stats ?? { resolved: 0, unresolved: [], deferred: 0 };

  return function transformer(tree: Root) {
    visit(tree, 'text', (node: Text, index, parent: Parent | undefined) => {
      if (!parent || index == null) return;

      const value = node.value;
      const matches = Array.from(value.matchAll(WIKILINK_RE));
      if (matches.length === 0) return;

      const newNodes: any[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [full, rawPath, anchor, display] = match;
        const startIndex = match.index!;

        if (startIndex > lastIndex) {
          newNodes.push({ type: 'text', value: value.slice(lastIndex, startIndex) });
        }

        const path = rawPath.trim();
        const lower = path.toLowerCase();
        const displayText = display?.trim() || lastSegment(path);

        const resolution = resolvePath(lower);
        if (resolution) {
          counter.resolved += 1;
          const anchorPart = anchor ? `#${slugifyAnchor(anchor)}` : '';
          const isLocalRule = 'isLocal' in resolution.rule && (resolution.rule as any).isLocal === true;
          const linkNode: Link = {
            type: 'link',
            url: resolution.url + anchorPart,
            title: null,
            children: [{ type: 'text', value: displayText }],
            data: {
              hProperties: {
                class: isLocalRule ? 'wikilink wikilink--local' : 'wikilink wikilink--external',
                ...(isLocalRule
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' }),
              },
            },
          };
          newNodes.push(linkNode);
        } else {
          if (isDeferred(lower)) {
            counter.deferred += 1;
          } else {
            counter.unresolved.push(lower);
          }
          // Render as plain text — no anchor, no class, no markup hint.
          newNodes.push({ type: 'text', value: displayText });
        }

        lastIndex = startIndex + full.length;
      }

      if (lastIndex < value.length) {
        newNodes.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
      // Don't return an explicit next-index — unist-util-visit handles the
      // splice-aware continuation when the visitor returns void (matches
      // the reference impl in lossless-monorepo/site/.../remark-backlinks.ts).
      // The new `link` nodes have a single `text` child with the displayText,
      // which contains no wikilink syntax, so re-visiting is harmless.
    });
  };
};
