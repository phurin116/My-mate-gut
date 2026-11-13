import { CLOSING_SOON_DAYS, NEW_LISTING_DAYS } from '../domain/catalog';
import { daysSince, daysUntil } from '../domain/dates';
import { matchListing, type MatchResult } from '../domain/matching';
import type {
  Application,
  Database,
  ID,
  Listing,
  Startup,
  Student,
  User,
  VerificationRecord,
  VerificationStatus,
  VerificationSubject,
} from '../domain/types';
import { useStore } from './store';

export function verificationFor(db: Database, type: VerificationSubject, id: ID): VerificationRecord | undefined {
  return db.verifications.find((v) => v.subjectType === type && v.subjectId === id);
}

export function startupStatus(db: Database, startupId: ID): VerificationStatus {
  return verificationFor(db, 'startup', startupId)?.status ?? 'unverified';
}

/**
 * A listing only counts as verified when both the role and the company behind it
 * are verified. Anything else falls back to the weaker of the two states.
 */
export function listingStatus(db: Database, listing: Listing): VerificationStatus {
  const company = startupStatus(db, listing.startupId);
  const own = verificationFor(db, 'listing', listing.id)?.status ?? 'unverified';
  if (company === 'verified' && own === 'verified') return 'verified';
  if (company === 'unverified' || own === 'unverified') return 'unverified';
  return 'pending';
}

export function isOpen(listing: Listing): boolean {
  return listing.status === 'open' && daysUntil(listing.deadline) >= 0;
}

export function isClosingSoon(listing: Listing): boolean {
  const d = daysUntil(listing.deadline);
  return isOpen(listing) && d <= CLOSING_SOON_DAYS;
}

export function isNew(listing: Listing): boolean {
  return daysSince(listing.postedAt) <= NEW_LISTING_DAYS;
}

export function startupOf(db: Database, listing: Listing): Startup | undefined {
  return db.startups.find((s) => s.id === listing.startupId);
}

export function matchFor(db: Database, student: Student | null, listing: Listing): MatchResult | null {
  if (!student) return null;
  return matchListing(student, listing, startupOf(db, listing));
}

export function applicationFor(db: Database, studentId: ID, listingId: ID): Application | undefined {
  return db.applications.find((a) => a.studentId === studentId && a.listingId === listingId);
}

export const ACTIVE_STATUSES: Application['status'][] = ['submitted', 'in_review', 'interview', 'offer', 'accepted'];

export function isActive(app: Application): boolean {
  return ACTIVE_STATUSES.includes(app.status);
}

export interface Session {
  db: Database;
  user: User | null;
  student: Student | null;
  startup: Startup | null;
  /** Key used for per-visitor UI state such as recently viewed. */
  viewerKey: string;
  unread: number;
}

export function useSession(): Session {
  const { db, sessionUserId } = useStore();
  const user = db.users.find((u) => u.id === sessionUserId) ?? null;
  const student = user?.studentId ? (db.students.find((s) => s.id === user.studentId) ?? null) : null;
  const startup = user?.startupId ? (db.startups.find((s) => s.id === user.startupId) ?? null) : null;
  const unread = user ? db.notifications.filter((n) => n.userId === user.id && !n.read).length : 0;
  return { db, user, student, startup, viewerKey: user?.id ?? 'guest', unread };
}

export function homePathFor(user: User | null): string {
  switch (user?.role) {
    case 'student':
      return '/dashboard';
    case 'startup':
      return '/startup';
    case 'university':
      return '/university';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
