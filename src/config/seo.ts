export interface SiteSEO {
  siteName: string;
  baseUrl?: string;
  twitterHandle?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
}

export const SITE_SEO: SiteSEO = {
  siteName: 'Michael P. Staton',
  baseUrl: import.meta.env.SITE ?? 'https://mpstaton.com',
  defaultTitle: 'Michael P. Staton - VC, Investor, Builder',
  defaultDescription:
    'VC, Investor, Angel, Cofounder, Catalyst. Investment track record across venture funds, angel investing, and co-investment vehicles.',
  defaultImage: '/share-banner.webp',
};

export type ShareMetaInput = {
  title?: string;
  description?: string;
  subtitle?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  /**
   * Packed availability bands, rendered as a strip on the generated card.
   * Diary events only — see packBands() in src/lib/diary/schedule.ts. Ignored
   * when `image` is set, since an explicit image wins over generation.
   */
  bands?: string;
};
