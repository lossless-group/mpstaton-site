import { defineMiddleware } from 'astro:middleware';
import { readSessionFromRequest } from './lib/promote/gate';

const GATED_PATTERN = /^\/promote\/[^/]+\/.+$/;
const HUB_PATTERN = /^\/promote\/([^/]+)\/?$/;

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const session = readSessionFromRequest(context.request.headers.get('cookie'));

  context.locals.promote = {
    unlocked: !!session,
    scope: session?.scope ?? null,
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
