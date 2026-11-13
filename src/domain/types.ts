/**
 * Domain model. Each interface maps to one table/collection in a future backend.
 * Relationships are by id only, so the same shapes can be served by an API.
 */

export type ID = string;
export type ISODate = string; // full ISO timestamp

export type Role = 'student' | 'startup' | 'university' | 'admin';

export type FieldId =
  | 'marketing'
  | 'product'
  | 'engineering'
  | 'design'
  | 'data'
  | 'finance'
  | 'bizdev'
  | 'operations'
  | 'content';

export type IndustryId =
  | 'fintech'
  | 'ecommerce'
  | 'edtech'
  | 'healthtech'
  | 'foodtech'
  | 'travel'
  | 'sustainability'
  | 'saas'
  | 'media'
  | 'logistics'
  | 'proptech';

export type MajorId =
  | 'business'
  | 'marketing'
  | 'finance'
  | 'economics'
  | 'cs'
  | 'engineering'
  | 'it'
  | 'design'
  | 'commarts'
  | 'arts'
  | 'science'
  | 'other';

export type WorkMode = 'onsite' | 'hybrid' | 'remote';
export type ExperienceLevel = 'none' | 'projects' | 'internship';

/** Account. Demo mode stores no passwords or credentials of any kind. */
export interface User {
  id: ID;
  role: Role;
  name: string;
  email: string;
  studentId?: ID;
  startupId?: ID;
  universityId?: ID;
  isDemo: boolean;
}

export interface University {
  id: ID;
  name: string;
  shortName: string;
  /** True only for universities with a platform licence (sample partner in demo). */
  partner: boolean;
}

export interface StudentPrefs {
  workModes: WorkMode[];
  paidOnly: boolean;
  /** Longest internship the student can commit to, in months. */
  maxDurationMonths: number | null;
}

export interface Student {
  id: ID;
  userId: ID;
  name: string;
  email: string;
  universityId: ID | null;
  major: MajorId | null;
  year: number | null;
  skills: string[];
  interests: FieldId[];
  industries: IndustryId[];
  careerGoal: FieldId | null;
  experience: ExperienceLevel | null;
  experienceNote: string;
  about: string;
  portfolioUrl: string;
  prefs: StudentPrefs;
  updatedAt: ISODate;
  isDemo: boolean;
}

export interface Startup {
  id: ID;
  name: string;
  tagline: string;
  about: string;
  industry: IndustryId;
  stage: string;
  teamSize: string;
  foundedYear: number;
  district: string;
  website: string;
  contactName: string;
  contactRole: string;
  /** Hue used for the generated monogram. No real logos are used. */
  hue: number;
  createdAt: ISODate;
  isDemo: boolean;
}

export type ListingStatus = 'open' | 'closed';

export interface Listing {
  id: ID;
  startupId: ID;
  title: string;
  field: FieldId;
  summary: string;
  responsibilities: string[];
  learning: string[];
  requirements: string[];
  skills: string[];
  /** True when the startup explicitly accepts applicants with no prior work experience. */
  noExperienceRequired: boolean;
  minYear: number;
  workMode: WorkMode;
  district: string;
  paid: boolean;
  stipendMonthly: number | null;
  durationMonths: number;
  hoursPerWeek: number;
  startDate: ISODate;
  deadline: ISODate;
  openings: number;
  supervisorName: string;
  supervisorRole: string;
  status: ListingStatus;
  postedAt: ISODate;
  updatedAt: ISODate;
  isDemo: boolean;
}

export type VerificationStatus = 'verified' | 'pending' | 'unverified';
export type VerificationSubject = 'startup' | 'listing';

export type StartupCheckId = 'registration' | 'contact' | 'presence' | 'conduct';
export type ListingCheckId = 'responsibilities' | 'supervisor' | 'terms' | 'eligibility';
export type CheckId = StartupCheckId | ListingCheckId;

/** One record per startup and per listing. A badge is only ever derived from this record. */
export interface VerificationRecord {
  id: ID;
  subjectType: VerificationSubject;
  subjectId: ID;
  status: VerificationStatus;
  checks: Partial<Record<CheckId, boolean>>;
  verifiedAt: ISODate | null;
  lastCheckedAt: ISODate | null;
  reviewerNote: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'in_review'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationEvent {
  at: ISODate;
  status: ApplicationStatus;
  /** Who caused the event. */
  actor: 'student' | 'startup';
  message: string;
}

export interface InterviewInfo {
  at: ISODate;
  mode: 'in_person' | 'video';
  place: string;
  withName: string;
  note: string;
}

export interface Application {
  id: ID;
  listingId: ID;
  startupId: ID;
  studentId: ID;
  status: ApplicationStatus;
  motivation: string;
  availableFrom: string;
  portfolioUrl: string;
  appliedAt: ISODate;
  updatedAt: ISODate;
  events: ApplicationEvent[];
  interview: InterviewInfo | null;
}

/** Only creatable when the linked application is `completed`, i.e. confirmed by the startup. */
export interface Review {
  id: ID;
  applicationId: ID;
  listingId: ID;
  startupId: ID;
  studentId: ID;
  rating: number;
  meaningfulWork: number;
  mentorship: number;
  body: string;
  createdAt: ISODate;
}

export interface SavedInternship {
  studentId: ID;
  listingId: ID;
  savedAt: ISODate;
}

export interface Notification {
  id: ID;
  userId: ID;
  kind: 'application' | 'verification' | 'listing' | 'review' | 'system';
  title: string;
  body: string;
  link: string;
  createdAt: ISODate;
  read: boolean;
}

export type ReportReason = 'misleading' | 'fake' | 'payment' | 'unsafe' | 'outdated' | 'other';

export interface Report {
  id: ID;
  subjectType: VerificationSubject;
  subjectId: ID;
  reason: ReportReason;
  details: string;
  reporterUserId: ID | null;
  createdAt: ISODate;
  status: 'open' | 'resolved';
}

export interface Database {
  schemaVersion: number;
  seededAt: ISODate;
  users: User[];
  universities: University[];
  students: Student[];
  startups: Startup[];
  listings: Listing[];
  verifications: VerificationRecord[];
  applications: Application[];
  reviews: Review[];
  saved: SavedInternship[];
  notifications: Notification[];
  reports: Report[];
  /** Listing ids recently opened, newest first, keyed by user id or "guest". */
  recentlyViewed: Record<string, ID[]>;
  /** Listing ids currently selected for comparison. */
  compare: ID[];
}
