import type { FieldId, IndustryId, MajorId, WorkMode, ExperienceLevel, ReportReason } from './types';

/** Fixed taxonomies. Display labels live in the i18n dictionaries, keyed by these ids. */

export const FIELDS: FieldId[] = [
  'marketing',
  'product',
  'engineering',
  'design',
  'data',
  'finance',
  'bizdev',
  'operations',
  'content',
];

export const INDUSTRIES: IndustryId[] = [
  'fintech',
  'ecommerce',
  'edtech',
  'healthtech',
  'foodtech',
  'travel',
  'sustainability',
  'saas',
  'media',
  'logistics',
  'proptech',
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
  business: ['bizdev', 'operations', 'marketing', 'product'],
  marketing: ['marketing', 'content', 'bizdev'],
  finance: ['finance', 'data', 'operations'],
  economics: ['finance', 'data', 'bizdev'],
  cs: ['engineering', 'data', 'product'],
  engineering: ['engineering', 'operations', 'product'],
  it: ['engineering', 'data', 'product'],
  design: ['design', 'content', 'product'],
  commarts: ['content', 'marketing', 'design'],
  arts: ['content', 'marketing', 'operations'],
  science: ['data', 'operations', 'product'],
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
