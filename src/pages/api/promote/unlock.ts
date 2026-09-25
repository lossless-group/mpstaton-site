import type { APIRoute } from 'astro';
import { buildSessionCookie, checkCode } from '../../../lib/promote/gate';
import { getOpportunity } from '../../../lib/promote/opportunities';
import { hubUrl } from '../../../lib/promote/urls';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const slug = String(formData.get('slug') ?? '');
  const code = String(formData.get('code') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '');

  if (!slug || !code) {
    return new Response('Missing slug or code', { status: 400 });
  }

  const opportunity = getOpportunity(slug);
  if (!opportunity) {
    return new Response('Unknown opportunity', { status: 404 });
  }

  const result = checkCode(slug, code, opportunity.gate?.env_key);
  if (!result.ok) {
    // Send them back where they came from. Bouncing a client proposal to the
    // /promote hub on a typo shows them the wrong surface entirely.
    const origin = redirectTo.startsWith(`/proposals/${slug}`)
      ? `/proposals/${slug}`
      : hubUrl(slug);
    const back = new URL(origin, request.url);
    back.searchParams.set('e', '1');
    return new Response(null, { status: 303, headers: { Location: back.toString() } });
  }

  // Both surfaces use this endpoint: /promote/<slug> for investment material,
  // /proposals/<slug> for client proposals. Anything else falls back.
  const allowed = [`/promote/${slug}`, `/proposals/${slug}`];
  const safeRedirect = allowed.some((prefix) => redirectTo.startsWith(prefix))
    ? redirectTo
    : hubUrl(slug);
  return new Response(null, {
    status: 303,
    headers: {
      'Set-Cookie': buildSessionCookie(result.scope),
      Location: safeRedirect,
    },
  });
};
