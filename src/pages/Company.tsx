import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Briefcase, Building2, Check, ExternalLink, Gift, Lightbulb, MessageSquare } from 'lucide-react';
import type { SkillId } from '../domain/catalog';
import { CompanyLogo } from '../components/CompanyLogo';
import { InternshipCard } from '../components/listing';
import { ReviewList, Stars } from '../components/reviews';
import { ReportButton, TrustBadge, VerificationPanel } from '../components/trust';
import { ButtonLink, DemoTag, EmptyState } from '../components/ui';
import { recordCompanyView } from '../data/actions';
import { companyOpenListings, startupStatus, useSession, verificationFor } from '../data/selectors';
import { useT } from '../i18n';

export default function Company() {
  const t = useT();
  const c = t.pub.company;
  const { id } = useParams();
  const { db, viewerKey } = useSession();
  const startup = db.startups.find((s) => s.id === id);

  useEffect(() => {
    if (startup) recordCompanyView(viewerKey, startup.id);
  }, [startup?.id, viewerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!startup) {
    return (
      <div className="container page">
        <EmptyState icon={<Building2 size={22} />} title={c.notFound} body={c.notFoundBody}>
          <ButtonLink to="/companies" variant="primary">
            {t.pub.companies.backToAll}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const listings = companyOpenListings(db, startup.id);
  const reviews = db.reviews.filter((r) => r.startupId === startup.id);
  const average = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const skills = [...new Set(listings.flatMap((l) => l.skills))];
  // What interns can learn is gathered from the startup's own open roles.
  const learn = [...new Set(listings.flatMap((l) => l.learning))].slice(0, 6);
  const status = startupStatus(db, startup.id);

  const facts: [string, React.ReactNode][] = [
    [c.facts.industry, t.industries[startup.industry]],
    [c.facts.type, t.companyKinds[startup.kind]],
    [c.facts.funding, startup.stage || c.notStated],
    [c.facts.team, startup.teamSize || c.notStated],
    [c.facts.founded, String(startup.foundedYear)],
    [c.facts.location, `${startup.district}, Bangkok`],
    [c.facts.contact, [startup.contactName, startup.contactRole].filter(Boolean).join(', ') || c.notStated],
    [
      c.facts.website,
      startup.website ? (
        <a href={startup.website} target="_blank" rel="noreferrer" className="link">
          {startup.website.replace(/^https?:\/\//, '')}
          <ExternalLink size={12} aria-hidden="true" style={{ display: 'inline', marginLeft: 4 }} />
        </a>
      ) : startup.isDemo ? (
        c.noWebsiteDemo
      ) : (
        c.notStated
      ),
    ],
  ];

  return (
    <div className="container page">
      <Link to="/companies" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {t.pub.companies.backToAll}
      </Link>

      <header className="company-hero card">
        <CompanyLogo company={startup} size={72} />
        <div className="grow">
          <h1>{startup.name}</h1>
          <p className="muted">{startup.tagline}</p>
          <div className="row-wrap" style={{ marginTop: 10 }}>
            <TrustBadge status={status} kind="company" />
            <span className="tag">{t.companyKinds[startup.kind]}</span>
            <span className="tag">{t.industries[startup.industry]}</span>
            {startup.isDemo && <DemoTag />}
          </div>
        </div>
        <div className="company-hero-cta">
          <span className="company-hero-count">
            <strong>{listings.length}</strong> {c.openCount(listings.length)}
          </span>
          {listings.length > 0 && (
            <a href="#open-roles" className="btn btn-primary" onClick={(e) => {
              e.preventDefault();
              document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              {c.viewRoles}
            </a>
          )}
        </div>
      </header>

      {startup.isDemo && (
        <div className="notice notice-info" style={{ marginTop: 16 }}>
          <Building2 size={18} aria-hidden="true" />
          <p>{c.demoNotice}</p>
        </div>
      )}

      <div className="detail-layout" style={{ marginTop: 24 }}>
        <div className="detail-main">
          <section className="detail-section">
            <h2>{c.about}</h2>
            <p>{startup.about}</p>
          </section>

          {(startup.problem || startup.products.length > 0) && (
            <section className="detail-section startup-two">
              {startup.problem && (
                <div>
                  <h2>{c.problem}</h2>
                  <p>{startup.problem}</p>
                </div>
              )}
              {startup.products.length > 0 && (
                <div>
                  <h2>{c.products}</h2>
                  <ul className="bullets">
                    {startup.products.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {startup.workplace && (
            <section className="detail-section">
              <h2>{c.workplace}</h2>
              <p>{startup.workplace}</p>
            </section>
          )}

          <section className="detail-section">
            <h2>{c.learn}</h2>
            {learn.length > 0 ? (
              <ul className="learn-list">
                {learn.map((x) => (
                  <li key={x}>
                    <Lightbulb size={16} aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">{c.learnEmpty}</p>
            )}
          </section>

          <section className="detail-section">
            <h2>{c.benefits}</h2>
            {startup.benefits.length ? (
              <ul className="benefit-list">
                {startup.benefits.map((b) => (
                  <li key={b}>
                    <Gift size={16} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">{c.notStated}</p>
            )}
          </section>

          <section className="detail-section" id="open-roles">
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

          {skills.length > 0 && (
            <section className="detail-section">
              <h2>{c.skills}</h2>
              <div className="row-wrap">
                {skills.map((s) => (
                  <span key={s} className="tag">
                    {t.skills[s as SkillId] ?? s}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="detail-section">
            <h2>{c.process}</h2>
            <ol className="process-list">
              {startup.process.map((step, i) => (
                <li key={step}>
                  <span className="process-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
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
              <EmptyState icon={<MessageSquare size={20} />} title={t.pub.detail.reviewsEmptyTitle} body={t.pub.detail.reviewsEmptyBody} />
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="card card-pad">
            <h2 className="eyebrow" style={{ marginBottom: 6 }}>
              {c.details}
            </h2>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card card-pad">
            <h2 className="eyebrow" style={{ marginBottom: 10 }}>
              {c.verification}
            </h2>
            <VerificationPanel record={verificationFor(db, 'startup', startup.id)} subject="startup" isDemo={startup.isDemo} />
          </div>
          <ul className="checklist small muted">
            <li>
              <Check size={14} aria-hidden="true" />
              {c.sideNote}
            </li>
          </ul>
          <ReportButton subjectType="startup" subjectId={startup.id} />
        </aside>
      </div>
    </div>
  );
}
