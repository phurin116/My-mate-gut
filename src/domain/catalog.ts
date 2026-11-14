import type { FieldId, IndustryId, MajorId, WorkMode, ExperienceLevel, ReportReason } from './types';

/** Fixed taxonomies. Display labels live in the i18n dictionaries, keyed by these ids. */

export const FIELDS: FieldId[] = [
  'marketing',
  'digital_marketing',
  'social_media',
  'content',
  'pr',
  'events',
  'sales',
  'bizdev',
  'finance',
  'accounting',
  'consulting',
  'hr',
  'graphic_design',
  'ux_design',
  'engineering',
  'data',
  'product',
  'ecommerce',
  'operations',
  'supply_chain',
];

export const INDUSTRIES: IndustryId[] = [
  'fintech',
  'healthtech',
  'edtech',
  'ecommerce',
  'ai',
  'saas',
  'foodtech',
  'climate',
  'creative',
  'logistics',
];

export const MAJORS: MajorId[] = [
  'business',
  'marketing',
  'finance',
  'economics',
  'cs',
  'engineering',
  'it',
  'design',
  'commarts',
  'arts',
  'science',
  'other',
];

/** Internship fields that a major prepares a student for. Used by the matching rules. */
export const MAJOR_FIELDS: Record<MajorId, FieldId[]> = {
  business: ['bizdev', 'consulting', 'operations', 'marketing', 'sales', 'product', 'hr', 'ecommerce', 'supply_chain'],
  marketing: ['marketing', 'digital_marketing', 'social_media', 'content', 'pr', 'events', 'sales', 'ecommerce', 'bizdev'],
  finance: ['finance', 'accounting', 'consulting', 'data', 'operations'],
  economics: ['consulting', 'finance', 'data', 'bizdev', 'supply_chain'],
  cs: ['engineering', 'data', 'product', 'ux_design'],
  engineering: ['engineering', 'operations', 'supply_chain', 'product', 'data'],
  it: ['engineering', 'data', 'product', 'ux_design', 'ecommerce'],
  design: ['graphic_design', 'ux_design', 'content', 'social_media'],
  commarts: ['content', 'pr', 'social_media', 'digital_marketing', 'marketing', 'events', 'graphic_design'],
  arts: ['content', 'pr', 'events', 'hr', 'social_media'],
  science: ['data', 'operations', 'supply_chain', 'product'],
  other: [],
};

export const SKILLS = [
  'communication',
  'writing',
  'presentation',
  'english',
  'social_media',
  'content_creation',
  'seo',
  'community',
  'market_research',
  'sales',
  'customer_support',
  'project_coordination',
  'excel',
  'data_analysis',
  'sql',
  'python',
  'javascript',
  'react',
  'html_css',
  'nocode',
  'figma',
  'ux_research',
  'graphic_design',
  'canva',
  'video_editing',
  'photography',
  'financial_modelling',
  'accounting',
  'copywriting',
  'google_ads',
  'adobe_creative',
  'event_planning',
  'negotiation',
  'recruiting',
  'power_bi',
  'supply_planning',
  'problem_solving',
] as const;

export type SkillId = (typeof SKILLS)[number];

export const WORK_MODES: WorkMode[] = ['onsite', 'hybrid', 'remote'];
export const EXPERIENCE_LEVELS: ExperienceLevel[] = ['none', 'projects', 'internship'];
export const REPORT_REASONS: ReportReason[] = ['misleading', 'fake', 'payment', 'unsafe', 'outdated', 'other'];

export const STARTUP_CHECKS = ['registration', 'contact', 'presence', 'conduct'] as const;
export const LISTING_CHECKS = ['responsibilities', 'supervisor', 'terms', 'eligibility'] as const;

/** A listing is "closing soon" when its deadline is this many days away or fewer. */
export const CLOSING_SOON_DAYS = 7;
/** A listing is "new" for this many days after it is posted. */
export const NEW_LISTING_DAYS = 7;
export const MAX_COMPARE = 3;
export const MAX_RECENT = 8;

export const COMPANY_KINDS = ['startup', 'growing', 'established'] as const;
/** Minimum monthly allowance options for the pay filter, in THB. */
export const PAY_STEPS = [8000, 10000, 12000, 15000] as const;
