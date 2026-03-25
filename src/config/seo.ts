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
};
