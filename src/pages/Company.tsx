import { Link, useParams } from 'react-router';
import { ArrowLeft, Briefcase, Building2, MessageSquare } from 'lucide-react';
import { InternshipCard } from '../components/listing';
import { ReviewList, Stars } from '../components/reviews';
import { ReportButton, TrustBadge, VerificationPanel } from '../components/trust';
import { ButtonLink, DemoTag, EmptyState, Monogram } from '../components/ui';
import { isOpen, startupStatus, useSession, verificationFor } from '../data/selectors';
import { useT } from '../i18n';

export default function Company() {
  const t = useT();
  const c = t.pub.company;
  const { id } = useParams();
  const { db } = useSession();
  const startup = db.startups.find((s) => s.id === id);

  if (!startup) {
    return (
      <div className="container page">
        <EmptyState icon={<Building2 size={22} />} title={c.notFound} body={c.notFoundBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const listings = db.listings.filter((l) => l.startupId === startup.id && isOpen(l));
  const reviews = db.reviews.filter((r) => r.startupId === startup.id);
  const average = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const facts: [string, string][] = [
    [c.facts.industry, t.industries[startup.industry]],
    [c.facts.stage, startup.stage],
    [c.facts.team, startup.teamSize],
    [c.facts.founded, String(startup.foundedYear)],
    [c.facts.location, `${startup.district}, Bangkok`],
    [c.facts.contact, [startup.contactName, startup.contactRole].filter(Boolean).join(', ')],
    [c.facts.website, startup.website],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="container page">
      <Link to="/internships" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {t.pub.detail.backToBrowse}
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          <header className="detail-head">
            <Monogram name={startup.name} hue={startup.hue} size="lg" />
            <div className="grow">
              <h1>{startup.name}</h1>
              <p className="detail-company muted">{startup.tagline}</p>
              <div className="row-wrap" style={{ marginTop: 10 }}>
                <TrustBadge status={startupStatus(db, startup.id)} kind="company" />
                {startup.isDemo && <DemoTag />}
              </div>
            </div>
          </header>

          <section className="detail-section">
            <h2>{c.about}</h2>
            <p>{startup.about}</p>
          </section>

          <section className="detail-section">
            <h2>
              {c.openRoles} <span className="count">{listings.length}</span>
            </h2>
            {listings.length > 0 ? (
              <div className="card-grid cols-2">
                {listings.map((l) => (
                  <InternshipCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Briefcase size={20} />} title={c.noRoles} body={c.noRolesBody}>
                <ButtonLink to={`/internships?industry=${startup.industry}`}>{t.notFound.cta}</ButtonLink>
              </EmptyState>
            )}
          </section>

          <section className="detail-section">
            <h2>{c.reviewsTitle}</h2>
            {reviews.length > 0 ? (
              <>
                <p className="row" style={{ marginBottom: 12 }}>
                  <Stars value={average} label={c.rating} />
                  <span className="small muted">{c.reviewCount(reviews.length)}</span>
                </p>
                <ReviewList reviews={reviews} />
              </>
            ) : (
              <EmptyState
                icon={<MessageSquare size={20} />}
                title={t.pub.detail.reviewsEmptyTitle}
                body={t.pub.detail.reviewsEmptyBody}
              />
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="card card-pad">
            <h2 className="eyebrow" style={{ marginBottom: 10 }}>
              {c.verification}
            </h2>
            <VerificationPanel record={verificationFor(db, 'startup', startup.id)} subject="startup" isDemo={startup.isDemo} />
          </div>
          <div className="card card-pad">
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ReportButton subjectType="startup" subjectId={startup.id} />
        </aside>
      </div>
    </div>
  );
}
