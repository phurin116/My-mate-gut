import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Building2, GraduationCap, Search } from 'lucide-react';
import { FIELDS } from '../domain/catalog';
import { isRecommended } from '../domain/matching';
import type { Listing } from '../domain/types';
import { InternshipCard } from '../components/listing';
import { TrustBadge } from '../components/trust';
import { ButtonLink } from '../components/ui';
import { isClosingSoon, isNew, isOpen, listingStatus, matchFor, startupStatus, useSession } from '../data/selectors';
import { useT } from '../i18n';

function Section({
  title,
  lead,
  to,
  listings,
  showReason,
}: {
  title: string;
  lead: string;
  to: string;
  listings: Listing[];
  showReason?: boolean;
}) {
  const t = useT();
  if (listings.length === 0) return null;
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          <p className="muted">{lead}</p>
        </div>
        <Link to={to} className="link-arrow">
          {t.actions.viewAll}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <div className="card-grid">
        {listings.map((l) => (
          <InternshipCard key={l.id} listing={l} showReason={showReason} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const t = useT();
  const h = t.pub.home;
  const navigate = useNavigate();
  const { db, user, student } = useSession();
  const [q, setQ] = useState('');
  const [field, setField] = useState('');

  const open = db.listings.filter(isOpen);
  const byDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const closing = byDeadline.filter(isClosingSoon).slice(0, 3);
  const beginner = byDeadline.filter((l) => l.noExperienceRequired && !closing.includes(l)).slice(0, 3);
  const newest = [...open].filter(isNew).sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 3);
  const recommended = student
    ? open
        .map((l) => ({ l, m: matchFor(db, student, l)! }))
        .filter(({ l, m }) => isRecommended(m) && listingStatus(db, l) !== 'unverified')
        .sort((a, b) => (b.m.score ?? 0) - (a.m.score ?? 0))
        .slice(0, 3)
        .map(({ l }) => l)
    : [];

  const stats = [
    { value: open.length, label: h.stats.open },
    { value: open.filter((l) => l.noExperienceRequired).length, label: h.stats.noExperience },
    { value: open.filter((l) => l.paid).length, label: h.stats.paid },
    { value: db.startups.filter((s) => startupStatus(db, s.id) === 'verified').length, label: h.stats.verified },
  ];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (field) params.set('field', field);
    navigate(`/internships${params.size ? `?${params}` : ''}`);
  };

  const quick = [
    { label: t.pub.browse.quick.beginner, to: '/internships?beginner=1' },
    { label: t.pub.browse.quick.paid, to: '/internships?paid=1' },
    { label: t.pub.browse.quick.flexible, to: '/internships?mode=hybrid,remote' },
    { label: t.pub.browse.quick.verified, to: '/internships?verified=1' },
    { label: t.pub.browse.quick.closing, to: '/internships?closing=1' },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">{h.eyebrow}</p>
            <h1 className="display hero-title">{h.title}</h1>
            <p className="hero-lead">{h.lead}</p>

            <form className="hero-search" role="search" onSubmit={onSearch}>
              <div className="hero-search-input">
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="home-q">
                  {h.searchLabel}
                </label>
                <input
                  id="home-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={h.searchPlaceholder}
                  autoComplete="off"
                />
              </div>
              <label className="sr-only" htmlFor="home-field">
                {h.fieldLabel}
              </label>
              <select id="home-field" className="select hero-select" value={field} onChange={(e) => setField(e.target.value)}>
                <option value="">{h.anyField}</option>
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {t.fields[f]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-lg">
                {h.search}
              </button>
            </form>

            <div className="hero-quick" aria-label={h.quick}>
              {quick.map((item) => (
                <Link key={item.to} to={item.to} className="chip">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <aside className="hero-panel" aria-label={h.stats.title}>
            <p className="eyebrow">{h.stats.title}</p>
            <dl className="hero-stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="display">{s.value}</dd>
                  <dt>{s.label}</dt>
                </div>
              ))}
            </dl>
            <p className="hero-panel-note">{t.demo.bannerShort}</p>
          </aside>
        </div>
      </section>

      <div className="container">
        {recommended.length > 0 && (
          <Section title={h.recommended} lead={h.recommendedLead} to="/dashboard" listings={recommended} showReason />
        )}
        <Section title={h.closingSoon} lead={h.closingSoonLead} to="/internships?closing=1&sort=deadline" listings={closing} />
        <Section title={h.noExperience} lead={h.noExperienceLead} to="/internships?beginner=1" listings={beginner} />
        <Section title={h.newest} lead={h.newestLead} to="/internships?recent=1&sort=newest" listings={newest} />

        <section className="section">
          <div className="section-head">
            <h2>{h.howTitle}</h2>
          </div>
          <ol className="steps">
            {h.steps.map((step, i) => (
              <li key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section trust-strip">
          <div className="trust-strip-text">
            <h2>{h.trustTitle}</h2>
            <p className="muted">{h.trustLead}</p>
            <Link to="/trust" className="link-arrow" style={{ marginTop: 12 }}>
              {t.nav.trust}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="trust-strip-list">
            {(['verified', 'pending', 'unverified'] as const).map((s) => (
              <li key={s}>
                <TrustBadge status={s} kind="listing" showTip={false} />
                <p className="small muted">{t.trust.short[s]}</p>
              </li>
            ))}
          </ul>
        </section>

        {!user && (
          <section className="section audience">
            <div className="card card-pad">
              <Building2 size={22} aria-hidden="true" className="audience-icon" />
              <h2>{h.startupTitle}</h2>
              <p className="muted">{h.startupBody}</p>
              <ButtonLink to="/signin?tab=create&as=startup" variant="secondary">
                {h.startupCta}
              </ButtonLink>
            </div>
            <div className="card card-pad">
              <GraduationCap size={22} aria-hidden="true" className="audience-icon" />
              <h2>{h.uniTitle}</h2>
              <p className="muted">{h.uniBody}</p>
              <ButtonLink to="/signin" variant="secondary">
                {h.uniCta}
              </ButtonLink>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
