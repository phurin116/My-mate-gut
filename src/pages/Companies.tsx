import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Building2, Search, X } from 'lucide-react';
import { COMPANY_KINDS, INDUSTRIES } from '../domain/catalog';
import type { CompanyKind, IndustryId } from '../domain/types';
import { CompanyCard } from '../components/company';
import { Button, EmptyState, PageHead, useDemoLoading, Skeleton } from '../components/ui';
import { companyOpenListings, startupStatus, useSession } from '../data/selectors';
import { useT } from '../i18n';

type Sort = 'roles' | 'az';

export default function Companies() {
  const t = useT();
  const c = t.pub.companies;
  const [params, setParams] = useSearchParams();
  const { db } = useSession();
  const loading = useDemoLoading('companies');

  const q = params.get('q') ?? '';
  const industry = (INDUSTRIES as string[]).includes(params.get('industry') ?? '') ? (params.get('industry') as IndustryId) : '';
  const kind = (COMPANY_KINDS as readonly string[]).includes(params.get('kind') ?? '') ? (params.get('kind') as CompanyKind) : '';
  const verified = params.get('verified') === '1';
  const hiring = params.get('hiring') === '1';
  const sort: Sort = params.get('sort') === 'az' ? 'az' : 'roles';

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const industriesInUse = useMemo(() => INDUSTRIES.filter((i) => db.startups.some((s) => s.industry === i)), [db.startups]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.startups
      .filter((s) => {
        if (term) {
          const hay = `${s.name} ${s.tagline} ${t.industries[s.industry]} ${s.district} ${t.companyKinds[s.kind]}`.toLowerCase();
          if (!term.split(/\s+/).every((w) => hay.includes(w))) return false;
        }
        if (industry && s.industry !== industry) return false;
        if (kind && s.kind !== kind) return false;
        if (verified && startupStatus(db, s.id) !== 'verified') return false;
        if (hiring && companyOpenListings(db, s.id).length === 0) return false;
        return true;
      })
      .map((s) => ({ s, n: companyOpenListings(db, s.id).length }))
      .sort((a, b) => (sort === 'az' ? a.s.name.localeCompare(b.s.name) : b.n - a.n || a.s.name.localeCompare(b.s.name)))
      .map((x) => x.s);
  }, [db, q, industry, kind, verified, hiring, sort, t]);

  const filtered = !!(industry || kind || verified || hiring);

  return (
    <div className="container page">
      <PageHead title={c.title} lead={c.lead} />

      <div className="company-toolbar">
        <div className="search-input">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="company-q" className="sr-only">
            {c.searchLabel}
          </label>
          <input
            id="company-q"
            type="search"
            value={q}
            placeholder={c.searchPlaceholder}
            onChange={(e) => update({ q: e.target.value })}
            autoComplete="off"
          />
          {q && (
            <button type="button" className="icon-btn" aria-label={t.actions.clear} onClick={() => update({ q: '' })}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <label className="sr-only" htmlFor="company-industry">
          {c.industry}
        </label>
        <select id="company-industry" className="select" value={industry} onChange={(e) => update({ industry: e.target.value })}>
          <option value="">{c.allIndustries}</option>
          {industriesInUse.map((i) => (
            <option key={i} value={i}>
              {t.industries[i]}
            </option>
          ))}
        </select>
      </div>

      <div className="company-filters">
        <div className="chips" role="group" aria-label={c.type}>
          {COMPANY_KINDS.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => update({ kind: kind === k ? '' : k })}>
              {t.companyKinds[k]}
            </button>
          ))}
          <button type="button" className="chip" aria-pressed={verified} onClick={() => update({ verified: verified ? '' : '1' })}>
            {c.verifiedOnly}
          </button>
          <button type="button" className="chip" aria-pressed={hiring} onClick={() => update({ hiring: hiring ? '' : '1' })}>
            {c.hiringOnly}
          </button>
        </div>
        <label className="row small">
          <span className="muted">{t.pub.browse.sort}</span>
          <select className="select select-sm" value={sort} onChange={(e) => update({ sort: e.target.value === 'az' ? 'az' : '' })}>
            <option value="roles">{c.sortRoles}</option>
            <option value="az">{c.sortAz}</option>
          </select>
        </label>
      </div>

      <p className="browse-count" aria-live="polite" style={{ marginBottom: 12 }}>
        {loading ? c.loading : c.count(results.length)}
      </p>

      {loading ? (
        <div className="company-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="ccard" aria-hidden="true">
              <div className="ccard-top">
                <Skeleton width={52} height={52} />
                <div className="grow stack" style={{ '--stack': '8px' } as React.CSSProperties}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
              <Skeleton height={12} />
              <Skeleton width="70%" height={12} />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<Building2 size={22} />} title={c.emptyTitle} body={c.emptyBody}>
          {(filtered || q) && (
            <Button variant="primary" onClick={() => setParams({}, { replace: true })}>
              {t.pub.browse.clearAll}
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="company-grid">
          {results.map((s) => (
            <CompanyCard key={s.id} company={s} />
          ))}
        </div>
      )}
    </div>
  );
}
