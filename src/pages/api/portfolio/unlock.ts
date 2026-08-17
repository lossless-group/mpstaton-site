import type { APIRoute } from 'astro';
import { buildMarkupsCookie, buildMarkupsClearCookie, checkMarkupsCode } from '../../../lib/track-record/gate';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const code = String(formData.get('code') ?? '');
  const intent = String(formData.get('intent') ?? 'unlock');

  if (intent === 'lock') {
    return new Response(null, {
      status: 303,
      headers: { 'Set-Cookie': buildMarkupsClearCookie(), Location: '/portfolio' },
    });
  }

  if (!code) {
    return new Response(null, { status: 303, headers: { Location: '/portfolio?e=1' } });
  }

  if (!checkMarkupsCode(code)) {
    // Same generic failure for a wrong code and an unconfigured gate — a
    // distinguishable message would tell a prober which one it hit.
    return new Response(null, { status: 303, headers: { Location: '/portfolio?e=1' } });
  }

  return new Response(null, {
    status: 303,
    headers: { 'Set-Cookie': buildMarkupsCookie(), Location: '/portfolio' },
  });
};
