import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowUpRight, Compass, Hammer, Layers, Network, Rocket, Search, Users } from 'lucide-react';
import { FIELDS, INDUSTRIES } from '../domain/catalog';
import { isRecommended } from '../domain/matching';
import type { Listing } from '../domain/types';
import { CompanyCard } from '../components/company';
import { CompanyLogo } from '../components/CompanyLogo';
import { INDUSTRY_ICONS } from '../components/industryIcons';
import { InternshipCard } from '../components/listing';
import { ButtonLink } from '../components/ui';
import {
  applicationFor,
  companyOpenListings,
  isClosingSoon,
  isNew,
  isOpen,
  listingStatus,
  matchFor,
  startupStatus,
  useSession,
} from '../data/selectors';
import { useT } from '../i18n';

type Tab = 'forYou' | 'featured' | 'beginner' | 'recent' | 'closing';

export default function Home() {
  const t = useT();
  const h = t.pub.home;
  const navigate = useNavigate();
  const { db, user, student } = useSession();
  const [q, setQ] = useState('');
  const [field, setField] = useState('');
  const [area, setArea] = useState('');

  // Everything below is counted from the live data, so the numbers always match the platform.
  const open = useMemo(() => db.listings.filter(isOpen), [db.listings]);
  const areas = useMemo(() => [...new Set(open.filter((l) => l.workMode !== 'remote').map((l) => l.district))].sort(), [open]);
  const byDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const hiring = db.startups.map((s) => ({ s, n: companyOpenListings(db, s.id).length })).filter((x) => x.n > 0);

  const groups: Record<Tab, Listing[]> = {
    forYou: student
      ? open
          .filter((l) => !applicationFor(db, student.id, l.id) && listingStatus(db, l) !== 'unverified')
          .map((l) => ({ l, m: matchFor(db, student, l)! }))
          .filter(({ m }) => isRecommended(m))
          .sort((a, b) => (b.m.score ?? 0) - (a.m.score ?? 0))
          .map(({ l }) => l)
      : [],
    featured: open
      .filter((l) => listingStatus(db, l) === 'verified' && l.stipendMonthly && l.supervisorName && !isClosingSoon(l))
      .sort((a, b) => Number(b.noExperienceRequired) - Number(a.noExperienceRequired) || (b.stipendMonthly ?? 0) - (a.stipendMonthly ?? 0))
      // At most one role per startup and per category, so the featured row shows the range of the platform.
      .filter((l, i, all) => all.findIndex((x) => x.startupId === l.startupId || x.field === l.field) === i),
    beginner: byDeadline.filter((l) => l.noExperienceRequired && listingStatus(db, l) !== 'unverified'),
    recent: [...open].filter(isNew).sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    closing: byDeadline.filter(isClosingSoon),
  };
  const tabs: Tab[] = groups.forYou.length ? ['forYou', 'featured', 'beginner', 'recent', 'closing'] : ['featured', 'beginner', 'recent', 'closing'];
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const shown = groups[tab].slice(0, 6);

  const industries = INDUSTRIES.map((id) => ({
    id,
    startups: db.startups.filter((s) => s.industry === id).length,
    roles: open.filter((l) => db.startups.find((s) => s.id === l.startupId)?.industry === id).length,
  })).filter((x) => x.startups > 0);

  // One verified, hiring startup from each of several industries for the hero panel and the showcase.
  const verifiedHiring = hiring.filter((x) => startupStatus(db, x.s.id) === 'verified').sort((a, b) => b.n - a.n || a.s.name.localeCompare(b.s.name));
  const spotlight: typeof verifiedHiring = [];
  for (const x of verifiedHiring) if (!spotlight.some((y) => y.s.industry === x.s.industry)) spotlight.push(x);
  const heroStartups = spotlight.slice(0, 4);
  const showcase = spotlight.slice(0, 6).map((x) => x.s);

  const stats = [
    { value: open.length, label: h.stats.open },
    { value: hiring.length, label: h.stats.companies },
    { value: industries.length, label: h.stats.industries },
    { value: open.filter((l) => l.noExperienceRequired).length, label: h.stats.noExperience },
  ];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (field) params.set('field', field);
    if (area) params.set('area', area);
    navigate(`/internships${params.size ? `?${params}` : ''}`);
  };

  const popularSearches: [string, string][] = [
    [t.fields.marketing, '/internships?field=marketing,digital_marketing,social_media'],
    [t.fields.engineering, '/internships?field=engineering'],
    [t.fields.data, '/internships?field=data'],
    [t.listing.noExperience, '/internships?exp=none'],
    [t.workModes.remote, '/internships?mode=remote'],
  ];

  const reasonIcons = [Hammer, Users, Rocket, Layers, Compass, Network];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="hero-eyebrow">{h.eyebrow}</p>
            <h1 className="hero-title">{h.title}</h1>
            <p className="hero-lead">{h.lead}</p>

            <form className="hero-search" role="search" onSubmit={onSearch}>
              <div className="hero-search-input">
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="home-q">
                  {h.searchLabel}
                </label>
                <input id="home-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={h.searchPlaceholder} autoComplete="off" />
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
              <label className="sr-only" htmlFor="home-area">
                {h.areaLabel}
              </label>
              <select id="home-area" className="select hero-select" value={area} onChange={(e) => setArea(e.target.value)}>
                <option value="">{h.anyArea}</option>
                <option value="remote">{t.workModes.remote}</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-lg">
                {h.search}
              </button>
            </form>

            <div className="hero-popular">
              <span>{h.popular}</span>
              {popularSearches.map(([label, to]) => (
                <Link key={label} to={to}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <aside className="hero-panel" aria-label={h.hiringNow}>
            <div className="hero-panel-head">
              <span>{h.hiringNow}</span>
              <Link to="/companies?hiring=1">
                {h.allStartups}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul>
              {heroStartups.map(({ s, n }) => (
                <li key={s.id}>
                  <Link to={`/companies/${s.id}`} className="hero-startup">
                    <CompanyLogo company={s} size={40} />
                    <span className="grow">
                      <span className="hero-startup-name">{s.name}</span>
                      <span className="hero-startup-meta">
                        {t.industries[s.industry]} · {s.stage}
                      </span>
                    </span>
                    <span className="hero-startup-roles">{h.roles(n)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="stat-strip" aria-label={h.stats.label}>
        <dl className="container">
          {stats.map((s) => (
            <div key={s.label}>
              <dd>{s.value}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
          <div className="stat-strip-note">
            <span className="tag tag-demo">{h.stats.label}</span>
          </div>
        </dl>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>{h.industries}</h2>
              <p className="muted">{h.industriesLead}</p>
            </div>
            <Link to="/companies" className="link-arrow">
              {h.exploreCompanies}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="industry-grid">
            {industries.map(({ id, startups, roles }) => {
              const Icon = INDUSTRY_ICONS[id];
              return (
                <li key={id}>
                  <Link to={`/companies?industry=${id}`} className="industry-tile">
                    <Icon size={22} aria-hidden="true" strokeWidth={1.6} />
                    <span className="industry-name">{t.industries[id]}</span>
                    <span className="industry-meta">{h.industryMeta(startups, roles)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>{h.opportunities}</h2>
              <p className="muted">{h.opportunitiesLead}</p>
            </div>
            <Link to={h.tabLinks[tab]} className="link-arrow">
              {h.seeAll}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="tabs home-tabs" role="tablist" aria-label={h.opportunities}>
            {tabs.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`home-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="home-tabpanel"
                className="tab"
                onClick={() => setTab(id)}
              >
                {h.tabs[id]} <span className="count">{groups[id].length}</span>
              </button>
            ))}
          </div>
          <div id="home-tabpanel" role="tabpanel" aria-labelledby={`home-tab-${tab}`}>
            {tab === 'featured' && <p className="small muted tab-note">{h.featuredNote}</p>}
            {shown.length ? (
              <div className="card-grid">
                {shown.map((l) => (
                  <InternshipCard key={l.id} listing={l} showReason={tab === 'forYou'} />
                ))}
              </div>
            ) : (
              <p className="muted tab-note">{h.tabEmpty}</p>
            )}
          </div>
        </section>
      </div>

      <section className="why">
        <div className="container why-grid">
          <div className="why-intro">
            <h2>{h.whyTitle}</h2>
            <p>{h.whyLead}</p>
            <p className="why-note">{h.whyNote}</p>
          </div>
          <ul className="why-list">
            {h.reasons.map((r, i) => {
              const Icon = reasonIcons[i];
              return (
                <li key={r.title}>
                  <Icon size={20} aria-hidden="true" strokeWidth={1.6} />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>{h.companies}</h2>
              <p className="muted">{h.companiesLead}</p>
            </div>
            <Link to="/companies" className="link-arrow">
              {h.exploreCompanies}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="company-grid is-home">
            {showcase.map((s) => (
              <CompanyCard key={s.id} company={s} />
            ))}
          </div>
        </section>

        <section className="section how">
          <h2>{h.howTitle}</h2>
          <ol className="steps">
            {h.steps.map((step, i) => (
              <li key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <Link to="/trust" className="link-arrow">
            {h.trustLink}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>

        <section className="section cta-band">
          <div>
            <h2>{h.ctaTitle}</h2>
            <p>{h.ctaBody}</p>
          </div>
          <div className="row-wrap">
            {user?.role === 'student' ? (
              <ButtonLink to="/dashboard" variant="secondary" size="lg">
                {h.ctaSignedIn}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/signin?tab=create" variant="secondary" size="lg">
                  {h.ctaPrimary}
                </ButtonLink>
                <ButtonLink to="/internships" variant="ghost" size="lg">
                  {h.ctaSecondary}
                </ButtonLink>
              </>
            )}
          </div>
          {!user && (
            <p className="cta-employers small">
              {h.employers} <Link to="/signin?tab=create&as=startup">{h.employersLink}</Link>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
