import { defineMiddleware } from 'astro:middleware';
import { readSessionFromRequest } from './lib/promote/gate';
import { readMarkupsSession } from './lib/track-record/gate';

const GATED_PATTERN = /^\/promote\/[^/]+\/.+$/;
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

  if (GATED_PATTERN.test(path) && !session) {
    const slugMatch = path.match(/^\/promote\/([^/]+)\//);
    const slug = slugMatch?.[1];
    if (slug) {
      return context.rewrite(`/promote/${slug}`);
    }
  }

  return next();
});
