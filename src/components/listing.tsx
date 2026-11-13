import { Link, useLocation } from 'react-router';
import {
  Banknote,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clock,
  MapPin,
  Scale,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { MAX_COMPARE } from '../domain/catalog';
import { daysUntil, formatBaht, formatDateShort } from '../domain/dates';
import type { MatchResult } from '../domain/matching';
import type { Listing } from '../domain/types';
import { toggleCompare, toggleSaved, clearCompare } from '../data/actions';
import {
  applicationFor,
  isNew,
  isOpen,
  listingStatus,
  matchFor,
  startupOf,
  useSession,
} from '../data/selectors';
import { useT } from '../i18n';
import { MatchRing, reasonSentence } from './match';
import { StatusPill, TrustBadge } from './trust';
import { ButtonLink, DemoTag, Skeleton, useToast } from './ui';
import { CompanyLogo } from './CompanyLogo';

export function useSaveToggle() {
  const t = useT();
  const toast = useToast();
  const { student, db } = useSession();
  const isSaved = (listingId: string) =>
    !!student && db.saved.some((s) => s.studentId === student.id && s.listingId === listingId);
  const toggle = (listingId: string) => {
    if (!student) {
      toast(t.pub.card.signInToSave, { kind: 'error', action: { label: t.actions.signIn, to: '/signin' } });
      return;
    }
    const saved = toggleSaved(student.id, listingId);
    toast(saved ? t.pub.card.saved : t.pub.card.removed, {
      action: saved ? { label: t.pub.card.viewSaved, to: '/saved' } : undefined,
    });
  };
  return { isSaved, toggle, canSave: true };
}

export function useCompareToggle() {
  const t = useT();
  const toast = useToast();
  const { db } = useSession();
  return {
    selected: db.compare,
    isSelected: (id: string) => db.compare.includes(id),
    toggle: (id: string) => {
      if (toggleCompare(id) === 'full') toast(t.pub.card.compareFull, { kind: 'error' });
    },
  };
}

/** Deadline indicator. Urgent styling only when the deadline is genuinely near. */
export function DeadlineTag({ listing }: { listing: Listing }) {
  const t = useT();
  if (!isOpen(listing)) return <span className="tag">{t.listing.closed}</span>;
  const d = daysUntil(listing.deadline);
  if (d <= 7) {
    const text = d === 0 ? t.listing.closesToday : d === 1 ? t.listing.closesTomorrow : t.listing.closesIn(d);
    return (
      <span className="tag tag-clay">
        <Clock size={12} aria-hidden="true" />
        {text}
      </span>
    );
  }
  return (
    <span className="deadline-plain">
      <CalendarDays size={14} aria-hidden="true" />
      {t.listing.deadline(formatDateShort(listing.deadline))}
    </span>
  );
}

export function stipendText(t: ReturnType<typeof useT>, listing: Listing): string {
  if (!listing.paid) return t.listing.stipendUnpaid;
  return listing.stipendMonthly ? t.listing.stipend(formatBaht(listing.stipendMonthly)) : t.listing.stipendUnknown;
}

export function InternshipCard({
  listing,
  showReason,
  match: matchProp,
}: {
  listing: Listing;
  /** Show the "Recommended because…" sentence. */
  showReason?: boolean;
  match?: MatchResult | null;
}) {
  const t = useT();
  const location = useLocation();
  const { db, user, student } = useSession();
  const save = useSaveToggle();
  const compare = useCompareToggle();
  const startup = startupOf(db, listing);
  const status = listingStatus(db, listing);
  const match = matchProp !== undefined ? matchProp : matchFor(db, student, listing);
  const application = student ? applicationFor(db, student.id, listing.id) : undefined;
  const saved = save.isSaved(listing.id);
  const selected = compare.isSelected(listing.id);
  const reason = showReason && match && student ? reasonSentence(t, match, { student, listing, startup }) : null;
  const canSave = !user || user.role === 'student';

  return (
    <article className="icard">
      <div className="icard-top">
        {startup && <CompanyLogo company={startup} />}
        <div className="grow">
          <h3 className="icard-title">
            <Link to={`/internships/${listing.id}`} state={{ from: location.pathname + location.search }}>
              {listing.title}
            </Link>
          </h3>
          <p className="icard-company">
            <span className="truncate">{startup?.name}</span>
          </p>
        </div>
        {match?.score != null && <MatchRing score={match.score} />}
      </div>

      <div className="icard-trust">
        <TrustBadge status={status} kind="listing" />
        {listing.isDemo && <DemoTag />}
        {isNew(listing) && <span className="tag tag-blue">{t.listing.newBadge}</span>}
        {match && !match.eligible && <span className="tag tag-amber">{t.listing.notEligible}</span>}
      </div>

      <p className="icard-summary">{listing.summary}</p>

      {reason && (
        <p className="icard-reason">
          <Sparkles size={14} aria-hidden="true" />
          <span>{reason}</span>
        </p>
      )}

      <ul className="icard-facts">
        <li>
          <Banknote size={14} aria-hidden="true" />
          {stipendText(t, listing)}
        </li>
        <li>
          <MapPin size={14} aria-hidden="true" />
          {t.workModes[listing.workMode]}
          {listing.workMode !== 'remote' ? ` · ${listing.district}` : ''}
        </li>
        <li>
          <Timer size={14} aria-hidden="true" />
          {t.listing.months(listing.durationMonths)}
        </li>
      </ul>

      <div className="icard-tags">
        <span className="tag">{t.fields[listing.field]}</span>
        {listing.noExperienceRequired ? (
          <span className="tag tag-brand">{t.listing.noExperience}</span>
        ) : (
          <span className="tag tag-outline">{t.listing.experienceNeeded}</span>
        )}
      </div>

      <div className="icard-foot">
        {application ? <StatusPill status={application.status} /> : <DeadlineTag listing={listing} />}
        <div className="row" style={{ gap: 2 }}>
          <button
            type="button"
            className={`icon-btn${selected ? ' is-on' : ''}`}
            aria-pressed={selected}
            aria-label={t.listing.compareAria(listing.title)}
            title={t.actions.compare}
            onClick={() => compare.toggle(listing.id)}
          >
            <Scale size={18} aria-hidden="true" />
          </button>
          {canSave && (
            <button
              type="button"
              className={`icon-btn${saved ? ' is-on' : ''}`}
              aria-pressed={saved}
              aria-label={saved ? t.listing.unsaveAria(listing.title) : t.listing.saveAria(listing.title)}
              title={saved ? t.actions.unsave : t.actions.save}
              onClick={() => save.toggle(listing.id)}
            >
              {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function InternshipCardSkeleton() {
  return (
    <div className="icard" aria-hidden="true">
      <div className="icard-top">
        <Skeleton width={44} height={44} />
        <div className="grow stack" style={{ '--stack': '8px' } as React.CSSProperties}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton width="45%" height={12} />
      <Skeleton height={12} />
      <Skeleton width="85%" height={12} />
      <Skeleton width="60%" height={12} />
      <div className="icard-foot">
        <Skeleton width={110} height={20} />
        <Skeleton width={70} height={28} />
      </div>
    </div>
  );
}

/** Compact row used in "recently viewed" and "similar" lists. */
export function InternshipRow({ listing }: { listing: Listing }) {
  const t = useT();
  const location = useLocation();
  const { db } = useSession();
  const startup = startupOf(db, listing);
  return (
    <Link
      to={`/internships/${listing.id}`}
      state={{ from: location.pathname + location.search }}
      className="irow"
    >
      {startup && <CompanyLogo company={startup} size={32} />}
      <span className="grow">
        <span className="irow-title truncate">{listing.title}</span>
        <span className="small muted truncate" style={{ display: 'block' }}>
          {startup?.name} · {stipendText(t, listing)}
        </span>
      </span>
      <DeadlineTag listing={listing} />
    </Link>
  );
}

/** Sticky bar shown while internships are selected for comparison. */
export function CompareBar() {
  const t = useT();
  const { db } = useSession();
  const location = useLocation();
  const ids = db.compare;
  if (ids.length === 0 || location.pathname === '/compare') return null;
  return (
    <div className="compare-bar" role="region" aria-label={t.pub.compare.title}>
      <div className="container compare-bar-inner">
        <span className="row grow">
          <Scale size={18} aria-hidden="true" />
          <span className="truncate">{t.pub.compareBar.selected(Math.min(ids.length, MAX_COMPARE))}</span>
        </span>
        <button type="button" className="icon-btn compare-clear" onClick={clearCompare} aria-label={t.pub.compare.clear}>
          <X size={18} aria-hidden="true" />
        </button>
        {ids.length >= 2 ? (
          <ButtonLink to="/compare" variant="primary" size="sm">
            {t.pub.compareBar.open}
          </ButtonLink>
        ) : (
          <span className="small compare-hint">{t.pub.compareBar.needTwo}</span>
        )}
      </div>
    </div>
  );
}
