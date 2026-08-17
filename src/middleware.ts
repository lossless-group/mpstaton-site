import { defineMiddleware } from 'astro:middleware';
import { readSessionFromRequest } from './lib/promote/gate';
import { readMarkupsSession } from './lib/track-record/gate';

const GATED_PATTERN = /^\/promote\/[^/]+\/.+$/;
const HUB_PATTERN = /^\/promote\/([^/]+)\/?$/;

export const onRequest = defineMiddleware(async (context, next) => {
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
