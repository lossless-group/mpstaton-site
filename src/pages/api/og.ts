/**
 * Dynamic OG Image Generation Endpoint
 *
 * Generates branded Open Graph images on-demand using satori + resvg.
 * Usage: /api/og?title=My+Title&description=My+description&subtitle=Portfolio
 */

import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Fetch and cache the Inter Bold font from Google Fonts
let fontDataCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;

  // Google Fonts CSS API returns a CSS file with the font URL
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
  );
  const css = await cssRes.text();
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!match) throw new Error('Could not extract font URL from Google Fonts CSS');

  const fontRes = await fetch(match[1]);
  fontDataCache = await fontRes.arrayBuffer();
  return fontDataCache;
}

// Brand colors
const PURPLE = '#9138E0';
const TEAL = '#22A6B5';
const ORANGE = '#F59C49';
const BG_DARK = '#0c0c1a';
const CARD_BG = '#16162a';
const TEXT_PRIMARY = '#f1f5f9';
const TEXT_MUTED = '#94a3b8';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);

    const title = url.searchParams.get('title') ?? 'Michael P. Staton';
    const description = url.searchParams.get('description') ?? '';
    const subtitle = url.searchParams.get('subtitle') ?? '';

    const truncatedTitle = title.length > 70 ? title.slice(0, 67) + '...' : title;
    const truncatedDesc = description.length > 120 ? description.slice(0, 117) + '...' : description;

    const fontData = await loadFont();

    const element = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG_DARK,
          color: TEXT_PRIMARY,
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Gradient accent bar at top
          {
            type: 'div',
            props: {
              style: {
                width: '100%',
                height: '6px',
                background: `linear-gradient(to right, ${PURPLE}, ${TEAL}, ${ORANGE})`,
              },
            },
          },
          // Main content area
          {
            type: 'div',
            props: {
              style: {
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                padding: '50px 60px',
              },
              children: [
                // Header row: name + subtitle badge
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '40px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '22px',
                            color: TEXT_MUTED,
                            letterSpacing: '0.02em',
                          },
                          children: 'Michael P. Staton',
                        },
                      },
                      ...(subtitle
                        ? [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  padding: '6px 18px',
                                  backgroundColor: PURPLE,
                                  borderRadius: '9999px',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase' as const,
                                  letterSpacing: '0.06em',
                                  color: '#fff',
                                },
                                children: subtitle,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
                // Content card
                {
                  type: 'div',
                  props: {
                    style: {
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '44px',
                      backgroundColor: CARD_BG,
                      borderRadius: '16px',
                      border: `1px solid #2a2a4a`,
                    },
                    children: [
                      // Title
                      {
                        type: 'h1',
                        props: {
                          style: {
                            fontSize: truncatedTitle.length > 40 ? '44px' : '56px',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            margin: 0,
                            marginBottom: truncatedDesc ? '24px' : '0',
                            background: `linear-gradient(135deg, ${TEXT_PRIMARY}, ${TEAL})`,
                            backgroundClip: 'text',
                            color: 'transparent',
                          },
                          children: truncatedTitle,
                        },
                      },
                      // Description
                      ...(truncatedDesc
                        ? [
                            {
                              type: 'p',
                              props: {
                                style: {
                                  fontSize: '24px',
                                  color: TEXT_MUTED,
                                  lineHeight: 1.4,
                                  margin: 0,
                                },
                                children: truncatedDesc,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
                // Footer: tagline + gradient dots
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '30px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '16px',
                            color: '#475569',
                          },
                          children: 'VC · Investor · Angel · Cofounder · Catalyst',
                        },
                      },
                      // Three brand dots
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            gap: '8px',
                          },
                          children: [PURPLE, TEAL, ORANGE].map((color) => ({
                            type: 'div',
                            props: {
                              style: {
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: color,
                              },
                            },
                          })),
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const svg = await satori(element as any, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('OG Image generation failed:', error);
    return new Response(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    );
  }
};
