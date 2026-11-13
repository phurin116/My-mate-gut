import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronRight,
  Link2,
  MessageSquare,
  Scale,
  SearchX,
  ShieldAlert,
  ShieldQuestion,
  UserRound,
} from 'lucide-react';
import type { SkillId } from '../domain/catalog';
import { formatDate } from '../domain/dates';
import { DeadlineTag, InternshipRow, stipendText, useCompareToggle, useSaveToggle } from '../components/listing';
import { MatchBreakdown, MatchRing, reasonSentence } from '../components/match';
import { ReviewList } from '../components/reviews';
import { ReportButton, StatusPill, TrustBadge, VerificationPanel } from '../components/trust';
import { Button, ButtonLink, DemoTag, EmptyState, Monogram, useToast } from '../components/ui';
import { recordView } from '../data/actions';
import {
  applicationFor,
  isOpen,
  listingStatus,
  matchFor,
  startupOf,
  startupStatus,
  useSession,
  verificationFor,
} from '../data/selectors';
import { useT } from '../i18n';

export default function InternshipDetail() {
  const t = useT();
  const d = t.pub.detail;
  const { id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const { db, user, student, viewerKey } = useSession();
  const save = useSaveToggle();
  const compare = useCompareToggle();
  const listing = db.listings.find((l) => l.id === id);

  useEffect(() => {
    if (listing) recordView(viewerKey, listing.id);
  }, [listing?.id, viewerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!listing) {
    return (
      <div className="container page">
        <EmptyState icon={<SearchX size={22} />} title={t.notFound.listingTitle} body={t.notFound.listingBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const startup = startupOf(db, listing);
  const status = listingStatus(db, listing);
  const open = isOpen(listing);
  const match = matchFor(db, student, listing);
  const application = student ? applicationFor(db, student.id, listing.id) : undefined;
  const saved = save.isSaved(listing.id);
  const from = (location.state as { from?: string } | null)?.from;
  const backTo = from && from.startsWith('/internships') ? from : '/internships';
  const reviews = db.reviews.filter((r) => r.startupId === listing.startupId);
  const similar = db.listings
    .filter((l) => l.id !== listing.id && isOpen(l) && (l.field === listing.field || l.startupId === listing.startupId))
    .sort((a, b) => Number(b.field === listing.field) - Number(a.field === listing.field))
    .slice(0, 4);
  const reason = match && student ? reasonSentence(t, match, { student, listing, startup }) : null;
  const canSave = !user || user.role === 'student';

  const applyAction = () => {
    if (application) {
      return (
        <ButtonLink to={`/applications/${application.id}`} variant="secondary" block>
          {d.viewApplication}
        </ButtonLink>
      );
    }
    if (!open) {
      return (
        <Button variant="primary" block disabled>
          {d.closed}
        </Button>
      );
    }
    if (!user) {
      return (
        <ButtonLink to="/signin" variant="primary" block size="lg" state={{ from: `/internships/${listing.id}/apply` }}>
          {d.signInToApply}
        </ButtonLink>
      );
    }
    if (user.role !== 'student') return null;
    return (
      <ButtonLink to={`/internships/${listing.id}/apply`} variant="primary" block size="lg">
        {d.apply}
      </ButtonLink>
    );
  };

  const facts: [string, string][] = [
    [d.facts.stipend, stipendText(t, listing)],
    [d.facts.duration, t.listing.months(listing.durationMonths)],
    [d.facts.hours, t.listing.hours(listing.hoursPerWeek)],
    [d.facts.arrangement, t.workModes[listing.workMode]],
    [d.facts.location, listing.workMode === 'remote' ? t.workModes.remote : `${listing.district}, Bangkok`],
    [d.facts.start, formatDate(listing.startDate)],
    [d.facts.eligibility, t.listing.minYear(listing.minYear)],
    [d.facts.experience, listing.noExperienceRequired ? t.listing.noExperience : t.listing.experienceNeeded],
    [d.facts.openings, String(listing.openings)],
  ];

  return (
    <div className="container page detail-page">
      <Link to={backTo} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {from && from.startsWith('/internships') ? d.backToResults : d.backToBrowse}
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          <header className="detail-head">
            <Monogram name={startup?.name ?? '?'} hue={startup?.hue ?? 0} size="lg" />
            <div className="grow">
              <h1>{listing.title}</h1>
              <p className="detail-company">
                <Link to={`/companies/${listing.startupId}`} className="link">
                  {startup?.name}
                </Link>
                <span className="muted"> · {startup ? t.industries[startup.industry] : ''}</span>
              </p>
              <div className="row-wrap" style={{ marginTop: 10 }}>
                <TrustBadge status={status} kind="listing" />
                {listing.isDemo && <DemoTag />}
                <span className="tag">{t.fields[listing.field]}</span>
                {listing.noExperienceRequired && <span className="tag tag-green">{t.listing.noExperience}</span>}
                {application && <StatusPill status={application.status} />}
              </div>
            </div>
          </header>

          {status === 'unverified' && (
            <div className="notice notice-danger" role="note">
              <ShieldAlert size={18} aria-hidden="true" />
              <div>
                <strong>{d.unverifiedWarnTitle}</strong>
                <p>{d.unverifiedWarn}</p>
              </div>
            </div>
          )}
          {status === 'pending' && (
            <div className="notice notice-warn" role="note">
              <ShieldQuestion size={18} aria-hidden="true" />
              <p>{d.pendingWarn}</p>
            </div>
          )}

          <section className="detail-section">
            <h2>{d.about}</h2>
            <p>{listing.summary}</p>
          </section>

          <section className="detail-section">
            <h2>{d.responsibilities}</h2>
            <ul className="checklist">
              {listing.responsibilities.map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="small muted" style={{ marginTop: 8 }}>
              {status === 'verified' ? d.responsibilitiesNote : d.responsibilitiesNoteUnverified}
            </p>
          </section>

          {listing.learning.length > 0 && (
            <section className="detail-section">
              <h2>{d.learning}</h2>
              <ul className="bullets">
                {listing.learning.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="detail-section">
            <h2>{d.requirements}</h2>
            <ul className="bullets">
              {listing.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>{t.listing.minYear(listing.minYear)}</li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>{d.skills}</h2>
            <div className="row-wrap">
              {listing.skills.map((s) => {
                const have = student?.skills.includes(s);
                return (
                  <span key={s} className={`tag${have ? ' tag-green' : ''}`}>
                    {have && <Check size={12} aria-hidden="true" />}
                    {t.skills[s as SkillId] ?? s}
                    {have && <span className="sr-only"> ({d.skillsYouHave})</span>}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="detail-section">
            <h2>{d.supervisor}</h2>
            {listing.supervisorName ? (
              <div className="row" style={{ gap: 12 }}>
                <span className="empty-icon" style={{ width: 40, height: 40 }} aria-hidden="true">
                  <UserRound size={18} />
                </span>
                <div>
                  <p style={{ fontWeight: 600 }}>{listing.supervisorName}</p>
                  <p className="small muted">{listing.supervisorRole}</p>
                </div>
              </div>
            ) : (
              <p className="muted">{d.supervisorMissing}</p>
            )}
          </section>

          <section className="detail-section">
            <h2>{d.company}</h2>
            <p>{startup?.about}</p>
            <div className="row-wrap" style={{ marginTop: 12 }}>
              <TrustBadge status={startupStatus(db, listing.startupId)} kind="company" />
              <Link to={`/companies/${listing.startupId}`} className="link-arrow">
                {d.viewCompany}
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="detail-section">
            <h2>{d.reviews}</h2>
            {reviews.length > 0 ? (
              <ReviewList reviews={reviews} />
            ) : (
              <EmptyState icon={<MessageSquare size={20} />} title={d.reviewsEmptyTitle} body={d.reviewsEmptyBody} />
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="card card-pad apply-card">
            <div className="spread">
              <span className="eyebrow">{d.applyBy}</span>
              <DeadlineTag listing={listing} />
            </div>
            <p className="apply-deadline display">{formatDate(listing.deadline)}</p>
            {application && <p className="small muted">{d.applied(formatDate(application.appliedAt))}</p>}
            {applyAction()}
            {user && user.role !== 'student' && (
              <p className="small muted">{user.startupId === listing.startupId ? d.ownerNote : d.otherRoleNote}</p>
            )}
            <div className="row" style={{ gap: 8 }}>
              {canSave && (
                <Button
                  className={`grow${saved ? ' is-active' : ''}`}
                  aria-pressed={saved}
                  icon={saved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
                  onClick={() => save.toggle(listing.id)}
                >
                  {saved ? t.actions.saved : t.actions.save}
                </Button>
              )}
              <Button
                className={`grow${compare.isSelected(listing.id) ? ' is-active' : ''}`}
                aria-pressed={compare.isSelected(listing.id)}
                icon={<Scale size={16} aria-hidden="true" />}
                onClick={() => compare.toggle(listing.id)}
              >
                {t.actions.compare}
              </Button>
            </div>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="small muted">
              {d.lastUpdated}: {formatDate(listing.updatedAt)}
            </p>
          </div>

          <div className="card card-pad">
            {match && student ? (
              match.score != null ? (
                <>
                  <div className="row" style={{ gap: 14, marginBottom: 12 }}>
                    <MatchRing score={match.score} size={64} />
                    <div>
                      <h2 className="card-title">{match.eligible ? t.match.title : t.match.titleLow}</h2>
                      {!match.eligible && <span className="tag tag-amber">{t.listing.notEligible}</span>}
                    </div>
                  </div>
                  {reason && match.eligible && <p className="small" style={{ marginBottom: 12 }}>{reason}</p>}
                  <MatchBreakdown match={match} ctx={{ student, listing, startup }} />
                </>
              ) : (
                <div className="stack">
                  <h2 className="card-title">{t.match.title}</h2>
                  <p className="muted small">{t.match.incomplete}</p>
                  <ButtonLink to="/profile" size="sm">
                    {t.match.completeProfile}
                  </ButtonLink>
                </div>
              )
            ) : !user ? (
              <div className="stack">
                <h2 className="card-title">{d.matchSignedOutTitle}</h2>
                <p className="muted small">{t.match.signedOut}</p>
                <ButtonLink to="/signin?tab=create" size="sm" state={{ from: `/internships/${listing.id}` }}>
                  {t.pub.browse.createProfile}
                </ButtonLink>
              </div>
            ) : (
              <p className="muted small">{t.match.method}</p>
            )}
          </div>

          <div className="card card-pad">
            <h2 className="eyebrow" style={{ marginBottom: 10 }}>
              {d.listingVerification}
            </h2>
            <VerificationPanel record={verificationFor(db, 'listing', listing.id)} subject="listing" isDemo={listing.isDemo} />
          </div>

          <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
            <ReportButton subjectType="listing" subjectId={listing.id} />
            <button
              type="button"
              className="link-arrow"
              style={{ color: 'var(--muted)' }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast(d.linkCopied);
                } catch {
                  toast(t.errors.generic, { kind: 'error' });
                }
              }}
            >
              <Link2 size={14} aria-hidden="true" />
              {d.share}
            </button>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>{d.similar}</h2>
          </div>
          <div className="card irow-list">
            {similar.map((l) => (
              <InternshipRow key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile: the primary action stays reachable while reading. */}
      {open && !application && (!user || user.role === 'student') && (
        <div className="sticky-apply">
          <div className="grow">
            <p className="truncate" style={{ fontWeight: 600 }}>
              {stipendText(t, listing)}
            </p>
            <p className="small muted truncate">{t.listing.deadline(formatDate(listing.deadline))}</p>
          </div>
          {user ? (
            <ButtonLink to={`/internships/${listing.id}/apply`} variant="primary">
              {d.applyShort}
            </ButtonLink>
          ) : (
            <ButtonLink to="/signin" variant="primary" state={{ from: `/internships/${listing.id}/apply` }}>
              {d.signInToApply}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}
