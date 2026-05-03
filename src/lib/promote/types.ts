export type MaterialType = 'deck' | 'memo' | 'data-room' | 'video' | 'qa-log';
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
  gate?: { override_code?: string | null };
}

export interface VariantsRegistry {
  deck?: Partial<Record<DeckFormat, { versions: number[]; default: number }>>;
  memo?: { versions: number[]; default: number };
}
