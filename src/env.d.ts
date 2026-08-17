/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    promote?: {
      unlocked: boolean;
      scope: string | null;
    };
    trackRecordMarkups?: {
      unlocked: boolean;
    };
  }
}

interface ImportMetaEnv {
  readonly PROMOTE_SESSION_SECRET?: string;
  readonly PROMOTE_MASTER_CODE_HASH?: string;
  readonly PROMOTE_OVERRIDE_CODES_JSON?: string;
  readonly PROMOTE_DEV_BYPASS?: string;
  readonly PORTFOLIO_SESSION_SECRET?: string;
  readonly PORTFOLIO_MARKUPS_CODE_HASH?: string;
  readonly PORTFOLIO_DEV_BYPASS?: string;
  readonly TRACK_RECORD_MARKUPS_JSON?: string;
  readonly SITE_BRAND?: string;
  readonly SITE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
