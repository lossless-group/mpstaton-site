import { defineMiddleware } from 'astro:middleware';
import { readSessionFromRequest } from './lib/promote/gate';
import { readMarkupsSession } from './lib/track-record/gate';

const GATED_PATTERN = /^\/(?:promote|proposals)\/[^/]+\/.+$/;
const HUB_PATTERN = /^\/promote\/([^/]+)\/?$/;

export const onRequest = defineMiddleware(async (context, next) => {
  // Middleware runs for prerendered routes too — at build time, where there is
  // no real request and `request.headers` is a stub Astro warns about. This
  // middleware exists only to read session cookies, which a route baked at
  // build time can never have, so there is nothing here for it to do.
  // /llms.txt and /llms-full.txt are the site's only `prerender = true` routes.
  // Both consumers of these locals read them optionally, so leaving them unset
  // on a prerendered route is the same as leaving them locked.
  if (context.isPrerendered) return next();

  const path = context.url.pathname;
  const cookieHeader = context.request.headers.get('cookie');
  const session = readSessionFromRequest(cookieHeader);

  context.locals.promote = {
    unlocked: !!session,
    scope: session?.scope ?? null,
  };

  // Separate, narrower gate: unlocks only the markup columns of /portfolio.
  // Holding a promote session does NOT unlock markups, and vice versa.
  context.locals.trackRecordMarkups = {
    unlocked: !!readMarkupsSession(cookieHeader),
  };

  // The PDF exporter drives headless Chrome, which has no way to carry a
  // session cookie. A dedicated token, scoped to the print route only and read
  // from the environment, lets the renderer through without weakening the gate
  // for anything else. Absent or mismatched, the normal rewrite applies.
  // Same dual read as lib/promote/gate.ts — process.env on Node, import.meta
  // for build-time inlined values.
  const exportToken =
    (typeof process !== 'undefined' ? process.env?.PROMOTE_EXPORT_TOKEN : undefined) ||
    (import.meta.env as Record<string, string | undefined>).PROMOTE_EXPORT_TOKEN ||
    undefined;
  const isPrintRoute = /^\/proposals\/[^/]+\/print\/?$/.test(path);
  const tokenOk =
    isPrintRoute &&
    !!exportToken &&
    context.url.searchParams.get('export_token') === exportToken;

  if (tokenOk) {
    context.locals.promote = { unlocked: true, scope: 'export' };
    return next();
  }

  if (GATED_PATTERN.test(path) && !session) {
    const slugMatch = path.match(/^\/(promote|proposals)\/([^/]+)\//);
    const section = slugMatch?.[1];
    const slug = slugMatch?.[2];
    if (section && slug) {
      return context.rewrite(`/${section}/${slug}`);
    }
  }

  return next();
});
