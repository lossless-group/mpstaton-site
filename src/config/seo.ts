export interface SiteSEO {
  siteName: string;
  baseUrl?: string;
  twitterHandle?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
}

export const SITE_SEO: SiteSEO = {
  siteName: 'MP Staton',
  defaultTitle: 'MP Staton - Investor, Builder, Writer',
  defaultDescription:
    'Personal site of MP Staton. Investment portfolio, blog, and curated posts.',
  defaultImage: '/share-banner.webp',
};

export type ShareMetaInput = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
};
