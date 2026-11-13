import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, BadgeCheck, CalendarClock, ClipboardList, FileText, ListChecks, Search, Sparkles, UserRound } from 'lucide-react';
import { FIELDS } from '../domain/catalog';
import { isRecommended } from '../domain/matching';
import type { FieldId, Listing } from '../domain/types';
import { CompanyCard } from '../components/company';
import { CompanyLogo } from '../components/CompanyLogo';
import { FIELD_ICONS } from '../components/fieldIcons';
import { DeadlineTag, InternshipCard, stipendText } from '../components/listing';
import { ButtonLink } from '../components/ui';
import {
  applicationFor,
  companyOpenListings,
  isClosingSoon,
  isNew,
  isOpen,
  listingStatus,
  matchFor,
  startupOf,
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

  const open = useMemo(() => db.listings.filter(isOpen), [db.listings]);
  const areas = useMemo(() => [...new Set(open.filter((l) => l.workMode !== 'remote').map((l) => l.district))].sort(), [open]);
  const byDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline));

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
      .sort((a, b) => Number(b.noExperienceRequired) - Number(a.noExperienceRequired) || (b.stipendMonthly ?? 0) - (a.stipendMonthly ?? 0)),
    beginner: byDeadline.filter((l) => l.noExperienceRequired && listingStatus(db, l) !== 'unverified'),
    recent: [...open].filter(isNew).sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    closing: byDeadline.filter(isClosingSoon),
  };
  const tabs: Tab[] = groups.forYou.length ? ['forYou', 'featured', 'beginner', 'recent', 'closing'] : ['featured', 'beginner', 'recent', 'closing'];
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const shown = groups[tab].slice(0, 6);

  const categoryCounts = FIELDS.map((f) => ({ f, n: open.filter((l) => l.field === f).length }))
    .filter((x) => x.n > 0)
    .slice(0, 12);

  const popular = [...db.startups]
    .map((s) => ({ s, n: companyOpenListings(db, s.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.s.name.localeCompare(b.s.name))
    .slice(0, 6)
    .map((x) => x.s);

  const stats = [
    { value: open.length, label: h.stats.open },
    { value: new Set(open.map((l) => l.startupId)).size, label: h.stats.companies },
    { value: open.filter((l) => l.noExperienceRequired).length, label: h.stats.noExperience },
    { value: open.filter((l) => l.paid).length, label: h.stats.paid },
  ];

  const preview = groups.closing.slice(0, 3);

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
    [t.fields.data, '/internships?field=data'],
    [t.fields.graphic_design, '/internships?field=graphic_design,ux_design'],
    [t.listing.noExperience, '/internships?exp=none'],
    [t.workModes.remote, '/internships?mode=remote'],
  ];

  const reasonIcons = [Sparkles, BadgeCheck, ListChecks, ClipboardList];
  const stepIcons = [UserRound, Search, FileText, CalendarClock];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="hero-badge">{h.badge}</p>
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
                <Search size={18} aria-hidden="true" />
                {h.search}
              </button>
            </form>

            <div className="hero-popular">
              <span className="small muted">{h.popular}</span>
              {popularSearches.map(([label, to]) => (
                <Link key={label} to={to} className="hero-popular-link">
                  {label}
                </Link>
              ))}
            </div>

            <dl className="hero-stats" aria-label={h.stats.label}>
              {stats.map((s) => (
                <div key={s.label}>
                  <dd>{s.value}</dd>
                  <dt>{s.label}</dt>
                </div>
              ))}
              <div className="hero-stats-note">
                <span className="tag tag-demo">{h.stats.label}</span>
              </div>
            </dl>
          </div>

          {preview.length > 0 && (
            <aside className="hero-preview" aria-label={h.previewTitle}>
              <p className="eyebrow">{h.previewTitle}</p>
              {preview.map((l) => {
                const s = startupOf(db, l);
                return (
                  <Link key={l.id} to={`/internships/${l.id}`} className="preview-card">
                    {s && <CompanyLogo company={s} size={40} />}
                    <span className="grow">
                      <span className="preview-title">{l.title}</span>
                      <span className="small muted">
                        {s?.name} · {stipendText(t, l)}
                      </span>
                    </span>
                    <DeadlineTag listing={l} />
                  </Link>
                );
              })}
              <Link to="/internships?closing=1&sort=deadline" className="link-arrow">
                {h.seeAll}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </aside>
          )}
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>{h.categories}</h2>
              <p className="muted">{h.categoriesLead}</p>
            </div>
            <Link to="/internships" className="link-arrow">
              {h.allCategories}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="cat-grid">
            {categoryCounts.map(({ f, n }) => {
              const Icon = FIELD_ICONS[f as FieldId];
              return (
                <li key={f}>
                  <Link to={`/internships?field=${f}`} className="cat-tile">
                    <span className="cat-icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <span className="grow">
                      <span className="cat-name">{t.fields[f]}</span>
                      <span className="small muted">{h.roles(n)}</span>
                    </span>
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
            {popular.map((s) => (
              <CompanyCard key={s.id} company={s} compact />
            ))}
          </div>
        </section>

        <section className="section how">
          <div>
            <h2 className="how-title">{h.howTitle}</h2>
            <ol className="steps">
              {h.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={step.title}>
                    <span className="step-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3>
                        <span className="step-num">{i + 1}.</span> {step.title}
                      </h3>
                      <p className="muted">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <h2 className="how-title">{h.whyTitle}</h2>
            <ul className="reasons">
              {h.reasons.map((r, i) => {
                const Icon = reasonIcons[i];
                return (
                  <li key={r.title}>
                    <Icon size={20} aria-hidden="true" className="reason-icon" />
                    <div>
                      <h3>{r.title}</h3>
                      <p className="muted">{r.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link to="/trust" className="link-arrow" style={{ marginTop: 12 }}>
              {h.trustLink}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
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
              {h.employers}{' '}
              <Link to="/signin?tab=create&as=startup">{h.employersLink}</Link>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
