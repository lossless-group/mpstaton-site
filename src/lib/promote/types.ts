export type MaterialType = 'deck' | 'memo' | 'proposal' | 'data-room' | 'video' | 'qa-log';
export type DeckFormat = 'scroll' | 'static' | 'interactive';
export type OpportunityStatus = 'active' | 'closing-soon' | 'closed' | 'paused';
export type MaterialStatus = 'live' | 'draft' | 'archived';

export interface Material {
  type: MaterialType;
  format?: DeckFormat;
  title: string;
  description?: string;
  primary?: boolean;
  status?: MaterialStatus;
  default_version?: number;
}

export interface OpportunityLogo {
  full_light?: string;
  full_dark?: string;
  symbol?: string;
  /**
   * Wordmark and symbol are rendered as CSS masks filled with currentColor,
   * not as <img>. The brand ships single-colour SVGs (`fill="none"` on the
   * root), so one asset then reads correctly on the dark screen document and
   * on the light print stylesheet without a second file.
   */
  wordmark?: string;
}

export interface Opportunity {
  slug: string;
  codename: string;
  company_name: string;
  status: OpportunityStatus;
  listed_in_index: boolean;
  short_description?: string;
  eyebrow?: string;
  logo?: OpportunityLogo;
  accent_color?: string;
  og_image?: string;
  materials: Material[];
  gate?: {
    override_code?: string | null;
    /**
     * Name of the environment variable holding this proposal's access code,
     * e.g. `PROPOSAL_LFG_SECRET`. One clearly-named variable per proposal
     * beats a single opaque JSON map keyed by slug — you can see at a glance
     * in the Vercel dashboard which proposal a value belongs to, and revoking
     * one means deleting one variable.
     */
    env_key?: string;
  };
}

export interface VariantsRegistry {
  deck?: Partial<Record<DeckFormat, { versions: number[]; default: number }>>;
  memo?: { versions: number[]; default: number };
  // Like memo, a proposal has only a version dimension — there is no
  // scroll/static/interactive progression for a document.
  proposal?: { versions: number[]; default: number };
}
