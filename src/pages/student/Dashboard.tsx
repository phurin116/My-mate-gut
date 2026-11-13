import { Link } from 'react-router';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChevronRight,
  Clock,
  FilePen,
  FileText,
  PartyPopper,
  Pencil,
  Sparkles,
  Star,
} from 'lucide-react';
import { daysUntil, formatDateShort, formatDateTime } from '../../domain/dates';
import { isRecommended, profileCompleteness } from '../../domain/matching';
import type { Listing, Startup } from '../../domain/types';
import { ApplicationRow } from '../../components/application';
import { CompanyLogo } from '../../components/CompanyLogo';
import { InternshipCard, InternshipRow } from '../../components/listing';
import { ResumeManager } from '../../components/resume';
import { ButtonLink, EmptyState } from '../../components/ui';
import { applicationFor, isActive, isOpen, listingStatus, matchFor, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

function Panel({ title, action, count, children }: { title: string; action?: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="panel-head">
        <h2 className="card-title">
          {title} {count ? <span className="count">{count}</span> : null}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const t = useT();
  const d = t.stu.dashboard;
  const { db, student, user, viewerKey } = useSession();
  if (!student || !user) return null;

  const completeness = profileCompleteness(student);
  const pct = Math.round((completeness.done / completeness.total) * 100);
  const applications = db.applications
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const submitted = applications.filter((a) => a.status !== 'draft');
  const active = applications.filter(isActive);
  const drafts = applications.filter((a) => a.status === 'draft');
  const savedListings = db.saved
    .filter((s) => s.studentId === student.id)
    .map((s) => db.listings.find((l) => l.id === s.listingId))
    .filter((l): l is Listing => !!l);

  const recommended = db.listings
    .filter((l) => isOpen(l) && !applicationFor(db, student.id, l.id) && listingStatus(db, l) !== 'unverified')
    .map((l) => ({ l, m: matchFor(db, student, l)! }))
    .filter(({ m }) => isRecommended(m))
    .sort((a, b) => (b.m.score ?? 0) - (a.m.score ?? 0))
    .slice(0, 4);

  // Upcoming deadlines: saved roles not yet applied to, plus unfinished drafts.
  const deadlineItems = [
    ...savedListings
      .filter((l) => isOpen(l) && !applicationFor(db, student.id, l.id))
      .map((l) => ({ l, kind: 'saved' as const })),
    ...drafts
      .map((a) => db.listings.find((l) => l.id === a.listingId))
      .filter((l): l is Listing => !!l && isOpen(l))
      .map((l) => ({ l, kind: 'draft' as const })),
  ]
    .filter(({ l }) => daysUntil(l.deadline) <= 21)
    .sort((a, b) => a.l.deadline.localeCompare(b.l.deadline))
    .slice(0, 5);

  // Things to act on now.
  const attention: { key: string; icon: React.ReactNode; title: string; sub: string; to: string }[] = [];
  for (const a of applications) {
    const listing = db.listings.find((l) => l.id === a.listingId);
    const startup = db.startups.find((s) => s.id === a.startupId);
    const sub = `${listing?.title ?? ''} · ${startup?.name ?? ''}`;
    if (a.status === 'offer')
      attention.push({ key: a.id, icon: <PartyPopper size={18} />, title: d.offerWaiting, sub, to: `/applications/${a.id}` });
    if (a.status === 'interview' && a.interview && daysUntil(a.interview.at) >= 0)
      attention.push({ key: a.id, icon: <CalendarClock size={18} />, title: d.interviewOn(formatDateTime(a.interview.at)), sub, to: `/applications/${a.id}` });
    if (a.status === 'completed' && !db.reviews.some((r) => r.applicationId === a.id))
      attention.push({ key: a.id, icon: <Star size={18} />, title: d.reviewInvite, sub, to: `/applications/${a.id}` });
  }
  if (!student.resume)
    attention.push({ key: 'resume', icon: <FileText size={18} />, title: d.resumeMissing, sub: d.resumeMissingSub, to: '/profile#resume' });

  const recentCompanies = (db.recentCompanies[viewerKey] ?? [])
    .map((id) => db.startups.find((s) => s.id === id))
    .filter((s): s is Startup => !!s)
    .slice(0, 6);
  const recentListings = (db.recentlyViewed[viewerKey] ?? [])
    .map((id) => db.listings.find((l) => l.id === id))
    .filter((l): l is Listing => !!l)
    .slice(0, 3);

  const notifications = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const stats = [
    { label: d.stats.submitted, value: submitted.length, to: '/applications' },
    { label: d.stats.active, value: active.length, to: '/applications' },
    { label: d.stats.interviews, value: applications.filter((a) => a.status === 'interview').length, to: '/applications' },
    { label: d.stats.saved, value: savedListings.length, to: '/saved' },
  ];

  const firstName = student.name.split(' ')[0];
  const hasBasics = completeness.done >= 4;

  return (
    <div className="container page">
      <header className="dash-hero">
        <div className="grow">
          <p className="eyebrow">{d.eyebrow}</p>
          <h1>{d.greeting(firstName)}</h1>
          <p className="muted">{d.lead}</p>
        </div>
        <div className="dash-progress card">
          <div className="progress-ring" style={{ '--pct': `${pct}%` } as React.CSSProperties} role="img" aria-label={d.profilePct(pct)}>
            <span>{pct}%</span>
          </div>
          <div className="grow">
            <p className="dash-progress-title">{d.profileTitle}</p>
            <p className="small muted">{pct === 100 ? d.profileDone : d.profileBody(completeness.total - completeness.done)}</p>
            <Link to="/profile" className="link-arrow" style={{ marginTop: 6 }}>
              <Pencil size={13} aria-hidden="true" />
              {d.editProfile}
            </Link>
          </div>
        </div>
      </header>

      <ul className="stat-grid">
        {stats.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="card stat">
              <span className="stat-value">{s.value}</span>
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
              <EmptyState icon={<Sparkles size={22} />} title={d.recommendedNeedsProfileTitle} body={d.recommendedNeedsProfileBody}>
                <ButtonLink to="/profile" variant="primary">
                  {d.profileCta}
                </ButtonLink>
              </EmptyState>
            )}
          </section>

          <Panel
            title={d.applications}
            count={applications.length}
            action={
              applications.length > 0 && (
                <Link to="/applications" className="link-arrow">
                  {t.actions.viewAll}
                </Link>
              )
            }
          >
            {applications.length > 0 ? (
              <ul className="app-list">
                {applications.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <ApplicationRow application={a} />
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
          </Panel>

          <Panel
            title={d.saved}
            count={savedListings.length}
            action={
              savedListings.length > 0 && (
                <Link to="/saved" className="link-arrow">
                  {t.actions.viewAll}
                </Link>
              )
            }
          >
            {savedListings.length > 0 ? (
              <div className="irow-list">
                {savedListings.slice(0, 4).map((l) => (
                  <InternshipRow key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <p className="muted small panel-empty">{d.savedEmpty}</p>
            )}
          </Panel>
        </div>

        <aside className="dash-side">
          <Panel title={d.attention} count={attention.length}>
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
              <p className="muted small panel-empty">{d.attentionEmpty}</p>
            )}
          </Panel>

          <Panel title={d.deadlines}>
            {deadlineItems.length > 0 ? (
              <ul className="deadline-list">
                {deadlineItems.map(({ l, kind }) => {
                  const days = daysUntil(l.deadline);
                  return (
                    <li key={kind + l.id}>
                      <Link to={kind === 'draft' ? `/internships/${l.id}/apply` : `/internships/${l.id}`} className="deadline-item">
                        <span className={`deadline-date${days <= 7 ? ' is-urgent' : ''}`}>
                          <span>{formatDateShort(l.deadline).split(' ')[0]}</span>
                          <span>{formatDateShort(l.deadline).split(' ')[1]}</span>
                        </span>
                        <span className="grow">
                          <span className="attention-title truncate">{l.title}</span>
                          <span className="small muted">
                            {kind === 'draft' ? (
                              <>
                                <FilePen size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {d.draftNotSubmitted}
                              </>
                            ) : (
                              d.savedNotApplied
                            )}
                            {' · '}
                            {days === 0 ? t.listing.closesToday : days === 1 ? t.listing.closesTomorrow : t.listing.closesIn(days)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted small panel-empty">{d.deadlinesEmpty}</p>
            )}
          </Panel>

          <Panel title={d.resume}>
            <div style={{ padding: '4px 20px 20px' }}>
              <ResumeManager student={student} compact />
            </div>
          </Panel>

          <Panel
            title={d.notifications}
            action={
              <Link to="/notifications" className="link-arrow">
                <Bell size={13} aria-hidden="true" />
                {t.actions.viewAll}
              </Link>
            }
          >
            {notifications.length > 0 ? (
              <ul className="attention-list">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link to={n.link} className="attention-item">
                      <span className="grow">
                        <span className="attention-title">
                          {!n.read && <span className="notif-dot inline" aria-hidden="true" />}
                          {n.title}
                        </span>
                        <span className="small muted">{formatDateTime(n.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small panel-empty">{t.stu.notifications.emptyTitle}</p>
            )}
          </Panel>

          {recentCompanies.length > 0 && (
            <Panel title={d.recentCompanies}>
              <ul className="recent-companies">
                {recentCompanies.map((s) => (
                  <li key={s.id}>
                    <Link to={`/companies/${s.id}`}>
                      <CompanyLogo company={s} size={40} />
                      <span className="small">{s.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {recentListings.length > 0 && (
            <Panel title={d.recent}>
              <div className="irow-list">
                {recentListings.map((l) => (
                  <InternshipRow key={l.id} listing={l} />
                ))}
              </div>
            </Panel>
          )}

          <p className="small muted">
            <Clock size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {d.savedLocally}
          </p>
        </aside>
      </div>
    </div>
  );
}
