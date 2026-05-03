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

  const result = checkCode(slug, code);
  if (!result.ok) {
    const back = new URL(hubUrl(slug), request.url);
    back.searchParams.set('e', '1');
    return new Response(null, { status: 303, headers: { Location: back.toString() } });
  }

  const safeRedirect = redirectTo.startsWith(`/promote/${slug}`) ? redirectTo : hubUrl(slug);
  return new Response(null, {
    status: 303,
    headers: {
      'Set-Cookie': buildSessionCookie(result.scope),
      Location: safeRedirect,
    },
  });
};
