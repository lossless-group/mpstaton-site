/**
 * Open Graph Meta Tag Builder
 *
 * Builds OG and Twitter Card meta tags with dynamic image generation support.
 */

import { SITE_SEO } from '../config/seo';
import type { ShareMetaInput } from '../config/seo';

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

function truncate(str: string, limit: number): string {
  if (str.length <= limit) return str;
  return str.slice(0, limit - 1).trim() + '…';
}

export function ensureAbsoluteUrl(url: string, siteUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = siteUrl || SITE_SEO.baseUrl || '';
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base.replace(/\/$/, '')}${path}`;
}

export interface DynamicOgImageParams {
  title: string;
  description?: string;
  subtitle?: string;
}

export function buildDynamicOgImageUrl(params: DynamicOgImageParams, siteUrl?: string): string {
  const base = siteUrl || SITE_SEO.baseUrl || '';
  const url = new URL('/api/og', base);
  url.searchParams.set('title', params.title);
  if (params.description) url.searchParams.set('description', params.description);
  if (params.subtitle) url.searchParams.set('subtitle', params.subtitle);
  return url.toString();
}

export function buildOgMeta(input: ShareMetaInput = {}, siteUrl?: string): MetaTag[] {
  const baseUrl = siteUrl || SITE_SEO.baseUrl || '';

  const title = truncate(input.title ?? SITE_SEO.defaultTitle, 70);
  const description = truncate(input.description ?? SITE_SEO.defaultDescription, 160);

  let image: string;
  let imageAlt: string;

  if (input.image) {
    image = ensureAbsoluteUrl(input.image, baseUrl);
    imageAlt = `${title} - ${SITE_SEO.siteName}`;
  } else if (input.title) {
    image = buildDynamicOgImageUrl({ title: input.title, description: input.description, subtitle: input.subtitle }, baseUrl);
    imageAlt = `${title} - ${SITE_SEO.siteName}`;
  } else {
    image = ensureAbsoluteUrl(SITE_SEO.defaultImage, baseUrl);
    imageAlt = SITE_SEO.siteName;
  }

  const url = input.url ? ensureAbsoluteUrl(input.url, baseUrl) : undefined;

  const meta: MetaTag[] = [
    { name: 'description', content: description },
    { property: 'og:type', content: input.type ?? 'website' },
    { property: 'og:site_name', content: SITE_SEO.siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: imageAlt },
  ];

  if (url) meta.push({ property: 'og:url', content: url });

  meta.push({ name: 'twitter:card', content: 'summary_large_image' });
  if (SITE_SEO.twitterHandle) meta.push({ name: 'twitter:site', content: SITE_SEO.twitterHandle });
  meta.push({ name: 'twitter:title', content: title });
  meta.push({ name: 'twitter:description', content: description });
  meta.push({ name: 'twitter:image', content: image });

  return meta;
}
