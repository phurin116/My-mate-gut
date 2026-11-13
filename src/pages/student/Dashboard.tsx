import { Link } from 'react-router';
import { ArrowRight, CalendarClock, ChevronRight, Clock, FileText, PartyPopper, Sparkles, Star, UserRound } from 'lucide-react';
import { daysUntil, formatDateTime } from '../../domain/dates';
import { isRecommended, profileCompleteness } from '../../domain/matching';
import type { Listing } from '../../domain/types';
import { ApplicationRow } from '../../components/application';
import { InternshipCard, InternshipRow } from '../../components/listing';
import { ButtonLink, EmptyState, PageHead } from '../../components/ui';
import { applicationFor, isActive, isClosingSoon, isOpen, listingStatus, matchFor, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

export default function Dashboard() {
  const t = useT();
  const d = t.stu.dashboard;
  const { db, student, viewerKey } = useSession();
  if (!student) return null;

  const completeness = profileCompleteness(student);
  const applications = db.applications
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const active = applications.filter(isActive);
  const savedListings = db.saved
    .filter((s) => s.studentId === student.id)
    .map((s) => db.listings.find((l) => l.id === s.listingId))
    .filter((l): l is Listing => !!l);

  const recommended = db.listings
    .filter((l) => isOpen(l) && !applicationFor(db, student.id, l.id))
    .map((l) => ({ l, m: matchFor(db, student, l)! }))
    .filter(({ l, m }) => isRecommended(m) && listingStatus(db, l) !== 'unverified')
    .sort((a, b) => (b.m.score ?? 0) - (a.m.score ?? 0))
    .slice(0, 6);

  // Things the student should act on, most urgent first.
  const attention: { key: string; icon: React.ReactNode; title: string; sub: string; to: string }[] = [];
  for (const a of applications) {
    const listing = db.listings.find((l) => l.id === a.listingId);
    const startup = db.startups.find((s) => s.id === a.startupId);
    const sub = `${listing?.title ?? ''} · ${startup?.name ?? ''}`;
    if (a.status === 'offer')
      attention.push({ key: a.id, icon: <PartyPopper size={18} />, title: d.offerWaiting, sub, to: `/applications/${a.id}` });
    if (a.status === 'interview' && a.interview && daysUntil(a.interview.at) >= 0)
      attention.push({
        key: a.id,
        icon: <CalendarClock size={18} />,
        title: d.interviewOn(formatDateTime(a.interview.at)),
        sub,
        to: `/applications/${a.id}`,
      });
    if (a.status === 'completed' && !db.reviews.some((r) => r.applicationId === a.id))
      attention.push({ key: a.id, icon: <Star size={18} />, title: d.reviewInvite, sub, to: `/applications/${a.id}` });
  }
  for (const l of savedListings) {
    if (isClosingSoon(l) && !applicationFor(db, student.id, l.id)) {
      const days = daysUntil(l.deadline);
      const text = days === 0 ? t.listing.closesToday : days === 1 ? t.listing.closesTomorrow : t.listing.closesIn(days);
      attention.push({
        key: `saved-${l.id}`,
        icon: <Clock size={18} />,
        title: d.savedClosing(text),
        sub: `${l.title} · ${db.startups.find((s) => s.id === l.startupId)?.name ?? ''}`,
        to: `/internships/${l.id}`,
      });
    }
  }

  const recent = (db.recentlyViewed[viewerKey] ?? [])
    .map((id) => db.listings.find((l) => l.id === id))
    .filter((l): l is Listing => !!l)
    .slice(0, 4);

  const stats = [
    { label: d.stats.active, value: active.length, to: '/applications' },
    { label: d.stats.interviews, value: applications.filter((a) => a.status === 'interview').length, to: '/applications' },
    { label: d.stats.offers, value: applications.filter((a) => a.status === 'offer' || a.status === 'accepted').length, to: '/applications' },
    { label: d.stats.saved, value: savedListings.length, to: '/saved' },
  ];

  const firstName = student.name.split(' ')[0];
  const hasBasics = completeness.done >= 4;

  return (
    <div className="container page">
      <PageHead title={d.greeting(firstName)} lead={d.lead} />

      {completeness.done < completeness.total && (
        <div className="card card-pad profile-nudge">
          <span className="empty-icon" aria-hidden="true">
            <UserRound size={20} />
          </span>
          <div className="grow">
            <h2 className="card-title">{d.profileTitle}</h2>
            <p className="muted small">{d.profileBody(completeness.done, completeness.total)}</p>
            <div className="meter" style={{ marginTop: 10, maxWidth: 320 }}>
              <span style={{ width: `${(completeness.done / completeness.total) * 100}%` }} />
            </div>
          </div>
          <ButtonLink to="/profile" variant="primary">
            {d.profileCta}
          </ButtonLink>
        </div>
      )}

      <ul className="stat-grid">
        {stats.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="card stat">
              <span className="stat-value display">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="dash-layout">
        <div className="dash-main">
          <section>
            <div className="section-head">
              <div>
                <h2>{d.recommended}</h2>
                <p className="muted">{d.recommendedLead}</p>
              </div>
              {recommended.length > 0 && (
                <Link to="/internships?sort=match" className="link-arrow">
                  {d.seeAllMatches}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
            {recommended.length > 0 ? (
              <div className="card-grid cols-2">
                {recommended.map(({ l, m }) => (
                  <InternshipCard key={l.id} listing={l} match={m} showReason />
                ))}
              </div>
            ) : hasBasics ? (
              <EmptyState icon={<Sparkles size={22} />} title={d.recommendedEmptyTitle} body={d.recommendedEmptyBody}>
                <ButtonLink to="/profile">{t.match.completeProfile}</ButtonLink>
                <ButtonLink to="/internships" variant="primary">
                  {t.notFound.cta}
                </ButtonLink>
              </EmptyState>
            ) : (
              <EmptyState
                icon={<Sparkles size={22} />}
                title={d.recommendedNeedsProfileTitle}
                body={d.recommendedNeedsProfileBody}
              >
                <ButtonLink to="/profile" variant="primary">
                  {d.profileCta}
                </ButtonLink>
              </EmptyState>
            )}
          </section>
        </div>

        <aside className="dash-side">
          <section className="card">
            <div className="panel-head">
              <h2 className="card-title">{d.attention}</h2>
              {attention.length > 0 && <span className="count">{attention.length}</span>}
            </div>
            {attention.length > 0 ? (
              <ul className="attention-list">
                {attention.map((item) => (
                  <li key={item.key + item.title}>
                    <Link to={item.to} className="attention-item">
                      <span className="attention-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="grow">
                        <span className="attention-title">{item.title}</span>
                        <span className="small muted truncate" style={{ display: 'block' }}>
                          {item.sub}
                        </span>
                      </span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small" style={{ padding: 20 }}>
                {d.attentionEmpty}
              </p>
            )}
          </section>

          <section className="card">
            <div className="panel-head">
              <h2 className="card-title">{d.applications}</h2>
              {applications.length > 0 && (
                <Link to="/applications" className="link-arrow">
                  {t.actions.viewAll}
                </Link>
              )}
            </div>
            {applications.length > 0 ? (
              <ul>
                {applications.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <ApplicationRow application={a} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: 16 }}>
                <EmptyState icon={<FileText size={20} />} title={d.applicationsEmptyTitle} body={d.applicationsEmptyBody}>
                  <ButtonLink to="/internships" variant="primary" size="sm">
                    {t.notFound.cta}
                  </ButtonLink>
                </EmptyState>
              </div>
            )}
          </section>

          {recent.length > 0 && (
            <section className="card">
              <div className="panel-head">
                <h2 className="card-title">{d.recent}</h2>
              </div>
              <div className="irow-list">
                {recent.map((l) => (
                  <InternshipRow key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
