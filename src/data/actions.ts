import { MAX_COMPARE, MAX_RECENT } from '../domain/catalog';
import { nowISO } from '../domain/dates';
import type {
  Application,
  ApplicationStatus,
  CheckId,
  Database,
  ID,
  IndustryId,
  InterviewInfo,
  Listing,
  Notification,
  ReportReason,
  Startup,
  StoredFile,
  Student,
  VerificationStatus,
  VerificationSubject,
} from '../domain/types';
import { dict } from '../i18n';
import { mutate, newId, getState, setSession, resetDatabase } from './store';

/**
 * All writes to the database. Each function is one use case and would map to
 * one API endpoint in a backend. Components never call `mutate` directly.
 */

function notify(db: Database, userIds: ID[], n: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>) {
  for (const userId of userIds) {
    db.notifications.unshift({ ...n, id: newId('n'), userId, createdAt: nowISO(), read: false });
  }
}

const startupUsers = (db: Database, startupId: ID) => db.users.filter((u) => u.startupId === startupId).map((u) => u.id);
const studentUser = (db: Database, studentId: ID) => db.users.filter((u) => u.studentId === studentId).map((u) => u.id);
const adminUsers = (db: Database) => db.users.filter((u) => u.role === 'admin').map((u) => u.id);

// ---------- Session ----------

export function signIn(userId: ID) {
  setSession(userId);
}

export function signOut() {
  setSession(null);
}

export function resetDemo() {
  resetDatabase();
}

export function registerStudent(input: { name: string; email: string; universityId: ID }): ID {
  const userId = newId('u');
  const studentId = newId('s');
  mutate((db) => {
    db.users.push({ id: userId, role: 'student', name: input.name, email: input.email, studentId, isDemo: false });
    db.students.push({
      id: studentId,
      userId,
      name: input.name,
      email: input.email,
      universityId: input.universityId,
      faculty: '',
      major: null,
      year: null,
      skills: [],
      interests: [],
      industries: [],
      careerGoal: null,
      experience: null,
      experienceNote: '',
      about: '',
      portfolioUrl: '',
      resume: null,
      prefs: { workModes: [], paidOnly: false, maxDurationMonths: null },
      updatedAt: nowISO(),
      isDemo: false,
    });
  });
  setSession(userId);
  return userId;
}

export interface StartupSignup {
  contactName: string;
  contactRole: string;
  email: string;
  companyName: string;
  industry: IndustryId;
  district: string;
  tagline: string;
  about: string;
  teamSize: string;
  foundedYear: number;
  website: string;
}

const LOGO_COLORS = ['#0F766E', '#7C3AED', '#B45309', '#BE123C', '#0369A1', '#4338CA', '#15803D', '#C2410C'];
const LOGO_SHAPES = ['square', 'circle', 'hex', 'pill', 'tab', 'diamond'] as const;

/** An original letter-mark logo for a newly registered company. */
function newCompanyLogo(name: string) {
  const seed = [...name].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return {
    shape: LOGO_SHAPES[seed % LOGO_SHAPES.length],
    bg: LOGO_COLORS[seed % LOGO_COLORS.length],
    fg: '#FFFFFF',
    mark: letters || '?',
    kind: 'letters' as const,
  };
}

export function registerStartup(input: StartupSignup): ID {
  const userId = newId('u');
  const startupId = newId('st');
  const t = dict();
  mutate((db) => {
    db.users.push({ id: userId, role: 'startup', name: input.contactName, email: input.email, startupId, isDemo: false });
    db.startups.push({
      id: startupId,
      name: input.companyName,
      tagline: input.tagline,
      about: input.about,
      industry: input.industry,
      stage: '',
      teamSize: input.teamSize,
      foundedYear: input.foundedYear,
      district: input.district,
      website: input.website,
      contactName: input.contactName,
      contactRole: input.contactRole,
      hue: 0,
      kind: 'startup',
      logo: newCompanyLogo(input.companyName),
      workplace: '',
      problem: '',
      products: [],
      benefits: [],
      process: [
        'Apply on InternGo with your profile and resume',
        'The hiring team reviews your application',
        'Interview with the team',
        'Decision and offer',
      ],
      createdAt: nowISO(),
      isDemo: false,
    });
    db.verifications.push({
      id: newId('v'),
      subjectType: 'startup',
      subjectId: startupId,
      status: 'pending',
      checks: {},
      verifiedAt: null,
      lastCheckedAt: null,
      reviewerNote: '',
    });
    notify(db, adminUsers(db), {
      kind: 'verification',
      title: t.notify.verificationRequested(input.companyName),
      body: t.notify.verificationRequestedBody,
      link: '/admin',
    });
  });
  setSession(userId);
  return userId;
}

// ---------- Student ----------

export function updateStudent(studentId: ID, patch: Partial<Student>) {
  mutate((db) => {
    const s = db.students.find((x) => x.id === studentId);
    if (!s) return;
    Object.assign(s, patch, { updatedAt: nowISO() });
    const u = db.users.find((x) => x.id === s.userId);
    if (u && patch.name) u.name = patch.name;
  });
}

/** Returns true when the listing is saved after the call. */
export function toggleSaved(studentId: ID, listingId: ID): boolean {
  let saved = false;
  mutate((db) => {
    const i = db.saved.findIndex((s) => s.studentId === studentId && s.listingId === listingId);
    if (i >= 0) db.saved.splice(i, 1);
    else {
      db.saved.unshift({ studentId, listingId, savedAt: nowISO() });
      saved = true;
    }
  });
  return saved;
}

export function recordView(viewerKey: string, listingId: ID) {
  const current = getState().db.recentlyViewed[viewerKey] ?? [];
  if (current[0] === listingId) return;
  mutate((db) => {
    db.recentlyViewed[viewerKey] = [listingId, ...current.filter((id) => id !== listingId)].slice(0, MAX_RECENT);
  });
}

export function toggleCompare(listingId: ID): 'added' | 'removed' | 'full' {
  const current = getState().db.compare;
  if (current.includes(listingId)) {
    mutate((db) => {
      db.compare = db.compare.filter((id) => id !== listingId);
    });
    return 'removed';
  }
  if (current.length >= MAX_COMPARE) return 'full';
  mutate((db) => {
    db.compare.push(listingId);
  });
  return 'added';
}

export function clearCompare() {
  mutate((db) => {
    db.compare = [];
  });
}

export interface ApplicationInput {
  motivation: string;
  availableFrom: string;
  portfolioUrl: string;
  resume: StoredFile | null;
}

/** Create or update a draft. Drafts are private to the student and never shown to the company. */
export function saveDraft(studentId: ID, listingId: ID, input: ApplicationInput): ID {
  const existing = getState().db.applications.find((a) => a.studentId === studentId && a.listingId === listingId);
  const id = existing?.id ?? newId('a');
  mutate((db) => {
    const at = nowISO();
    const app = db.applications.find((a) => a.id === id);
    if (app) {
      if (app.status !== 'draft') return;
      Object.assign(app, input, { updatedAt: at });
      return;
    }
    const listing = db.listings.find((l) => l.id === listingId);
    if (!listing) return;
    db.applications.unshift({
      ...input,
      id,
      listingId,
      startupId: listing.startupId,
      studentId,
      status: 'draft',
      appliedAt: at,
      updatedAt: at,
      events: [],
      interview: null,
    });
  });
  return id;
}

export function deleteDraft(applicationId: ID) {
  mutate((db) => {
    db.applications = db.applications.filter((a) => !(a.id === applicationId && a.status === 'draft'));
  });
}

/**
 * Submit an application (turning an existing draft into a submission).
 * In demo mode this only records the submission in this browser and notifies
 * the company's account here. Nothing is sent to any real organisation.
 */
export function applyToListing(studentId: ID, listingId: ID, input: ApplicationInput): ID {
  const draftId = saveDraft(studentId, listingId, input);
  const t = dict();
  mutate((db) => {
    const app = db.applications.find((a) => a.id === draftId);
    const listing = db.listings.find((l) => l.id === listingId);
    const student = db.students.find((s) => s.id === studentId);
    if (!app || !listing || !student || app.status !== 'draft') return;
    const at = nowISO();
    Object.assign(app, input, { status: 'submitted', appliedAt: at, updatedAt: at });
    app.events = [{ at, status: 'submitted', actor: 'student', message: '' }];
    notify(db, startupUsers(db, listing.startupId), {
      kind: 'application',
      title: t.notify.newApplication(listing.title),
      body: t.notify.newApplicationBody(student.name),
      link: `/startup/listings/${listing.id}/applicants`,
    });
  });
  return draftId;
}

/** Set or clear the student's current resume. Old files are deleted only if no application still uses them. */
export function setResume(studentId: ID, resume: StoredFile | null): StoredFile | null {
  let previous: StoredFile | null = null;
  mutate((db) => {
    const s = db.students.find((x) => x.id === studentId);
    if (!s) return;
    previous = s.resume;
    s.resume = resume;
    s.updatedAt = nowISO();
  });
  const old = previous as StoredFile | null;
  if (old && !getState().db.applications.some((a) => a.resume?.id === old.id && a.status !== 'draft')) return old;
  return null;
}

export function recordCompanyView(viewerKey: string, companyId: ID) {
  const current = getState().db.recentCompanies[viewerKey] ?? [];
  if (current[0] === companyId) return;
  mutate((db) => {
    db.recentCompanies[viewerKey] = [companyId, ...current.filter((id) => id !== companyId)].slice(0, MAX_RECENT);
  });
}

function pushStatus(
  app: Application,
  status: ApplicationStatus,
  actor: 'student' | 'startup',
  message: string,
) {
  const at = nowISO();
  app.status = status;
  app.updatedAt = at;
  app.events.push({ at, status, actor, message });
}

/** Student-side status changes: withdraw, accept or decline an offer. */
export function studentSetStatus(applicationId: ID, status: 'withdrawn' | 'accepted' | 'declined') {
  const t = dict();
  mutate((db) => {
    const app = db.applications.find((a) => a.id === applicationId);
    if (!app) return;
    pushStatus(app, status, 'student', '');
    const listing = db.listings.find((l) => l.id === app.listingId);
    const student = db.students.find((s) => s.id === app.studentId);
    notify(db, startupUsers(db, app.startupId), {
      kind: 'application',
      title: t.notify.studentUpdate(student?.name ?? '', t.status[status]),
      body: listing?.title ?? '',
      link: `/startup/listings/${app.listingId}/applicants`,
    });
  });
}

/** Startup-side status changes. Every change is recorded on the timeline and notifies the student. */
export function startupSetStatus(
  applicationId: ID,
  status: Extract<ApplicationStatus, 'in_review' | 'interview' | 'offer' | 'rejected' | 'completed'>,
  message: string,
  interview?: InterviewInfo,
) {
  const t = dict();
  mutate((db) => {
    const app = db.applications.find((a) => a.id === applicationId);
    if (!app) return;
    pushStatus(app, status, 'startup', message);
    if (status === 'interview' && interview) app.interview = interview;
    const listing = db.listings.find((l) => l.id === app.listingId);
    const startup = db.startups.find((s) => s.id === app.startupId);
    notify(db, studentUser(db, app.studentId), {
      kind: status === 'completed' ? 'review' : 'application',
      title: t.notify.statusChanged(startup?.name ?? '', t.status[status]),
      body: status === 'completed' ? t.notify.reviewInvite : (listing?.title ?? ''),
      link: `/applications/${app.id}`,
    });
  });
}

export function submitReview(
  applicationId: ID,
  input: { rating: number; meaningfulWork: number; mentorship: number; body: string },
): boolean {
  let ok = false;
  mutate((db) => {
    const app = db.applications.find((a) => a.id === applicationId);
    // Reviews are only accepted for internships the startup confirmed as completed.
    if (!app || app.status !== 'completed') return;
    if (db.reviews.some((r) => r.applicationId === applicationId)) return;
    db.reviews.unshift({
      id: newId('r'),
      applicationId,
      listingId: app.listingId,
      startupId: app.startupId,
      studentId: app.studentId,
      createdAt: nowISO(),
      ...input,
    });
    ok = true;
  });
  return ok;
}

export function submitReport(input: {
  subjectType: VerificationSubject;
  subjectId: ID;
  reason: ReportReason;
  details: string;
  reporterUserId: ID | null;
}) {
  const t = dict();
  mutate((db) => {
    db.reports.unshift({ ...input, id: newId('rep'), createdAt: nowISO(), status: 'open' });
    notify(db, adminUsers(db), {
      kind: 'system',
      title: t.notify.newReport,
      body: t.reportReasons[input.reason],
      link: '/admin',
    });
  });
}

// ---------- Startup ----------

export type ListingInput = Omit<Listing, 'id' | 'startupId' | 'status' | 'postedAt' | 'updatedAt' | 'isDemo'>;

/**
 * Create or update a listing. New and edited listings always go back to
 * "pending" so a verified badge never covers content nobody has checked.
 */
export function saveListing(startupId: ID, input: ListingInput, listingId?: ID): ID {
  const id = listingId ?? newId('l');
  const t = dict();
  mutate((db) => {
    const at = nowISO();
    const existing = db.listings.find((l) => l.id === id);
    if (existing) Object.assign(existing, input, { updatedAt: at });
    else db.listings.unshift({ ...input, id, startupId, status: 'open', postedAt: at, updatedAt: at, isDemo: false });

    const record = db.verifications.find((v) => v.subjectType === 'listing' && v.subjectId === id);
    if (record) Object.assign(record, { status: 'pending', checks: {}, verifiedAt: null, reviewerNote: '' });
    else
      db.verifications.push({
        id: newId('v'),
        subjectType: 'listing',
        subjectId: id,
        status: 'pending',
        checks: {},
        verifiedAt: null,
        lastCheckedAt: null,
        reviewerNote: '',
      });
    notify(db, adminUsers(db), {
      kind: 'verification',
      title: t.notify.verificationRequested(input.title),
      body: t.notify.listingReviewBody,
      link: '/admin',
    });
  });
  return id;
}

export function setListingOpen(listingId: ID, open: boolean) {
  mutate((db) => {
    const l = db.listings.find((x) => x.id === listingId);
    if (l) Object.assign(l, { status: open ? 'open' : 'closed', updatedAt: nowISO() });
  });
}

export function updateStartup(startupId: ID, patch: Partial<Startup>) {
  mutate((db) => {
    const s = db.startups.find((x) => x.id === startupId);
    if (s) Object.assign(s, patch);
  });
}

// ---------- Verification team ----------

export function setVerification(
  recordId: ID,
  status: VerificationStatus,
  checks: Partial<Record<CheckId, boolean>>,
  note: string,
) {
  const t = dict();
  mutate((db) => {
    const r = db.verifications.find((v) => v.id === recordId);
    if (!r) return;
    const at = nowISO();
    r.status = status;
    r.checks = checks;
    r.reviewerNote = note;
    r.lastCheckedAt = at;
    r.verifiedAt = status === 'verified' ? (r.verifiedAt ?? at) : null;
    const startupId =
      r.subjectType === 'startup' ? r.subjectId : db.listings.find((l) => l.id === r.subjectId)?.startupId;
    const name =
      r.subjectType === 'startup'
        ? db.startups.find((s) => s.id === r.subjectId)?.name
        : db.listings.find((l) => l.id === r.subjectId)?.title;
    if (startupId) {
      notify(db, startupUsers(db, startupId), {
        kind: 'verification',
        title: t.notify.verificationResult(name ?? '', t.trust.status[status]),
        body: note,
        link: '/startup',
      });
    }
  });
}

export function resolveReport(reportId: ID) {
  mutate((db) => {
    const r = db.reports.find((x) => x.id === reportId);
    if (r) r.status = 'resolved';
  });
}

// ---------- Notifications ----------

export function markRead(notificationId: ID) {
  mutate((db) => {
    const n = db.notifications.find((x) => x.id === notificationId);
    if (n) n.read = true;
  });
}

export function markAllRead(userId: ID) {
  mutate((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  });
}

/**
 * Simulated network latency for demo mode, so pending and loading states are
 * exercised the same way they will be with a real API.
 */
export function demoLatency(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
