import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { COMPANY_KINDS, FIELDS, INDUSTRIES, PAY_STEPS, WORK_MODES, type SkillId } from '../domain/catalog';
import { formatBaht } from '../domain/dates';
import { profileCompleteness } from '../domain/matching';
import type { CompanyKind, FieldId, IndustryId, Listing, WorkMode } from '../domain/types';
import { InternshipCard, InternshipCardSkeleton, InternshipRow } from '../components/listing';
import { Button, ButtonLink, Dialog, EmptyState, PageHead, useDemoLoading } from '../components/ui';
import { isClosingSoon, isNew, isOpen, listingStatus, matchFor, startupOf, useSession } from '../data/selectors';
import { useT } from '../i18n';

type Sort = 'match' | 'newest' | 'deadline' | 'az' | 'stipend';
const SORTS: Sort[] = ['match', 'newest', 'deadline', 'az', 'stipend'];
const TOGGLES = ['verified', 'closing', 'recent'] as const;
type Toggle = (typeof TOGGLES)[number];

interface Filters {
  q: string;
  field: FieldId[];
  area: string;
  mode: WorkMode[];
  pay: string;
  dur: '' | 'short' | 'long';
  exp: '' | 'none' | 'some';
  industry: IndustryId[];
  stage: CompanyKind[];
  toggles: Record<Toggle, boolean>;
  sort: Sort | '';
}

const EMPTY: Filters = {
  q: '',
  field: [],
  area: '',
  mode: [],
  pay: '',
  dur: '',
  exp: '',
  industry: [],
  stage: [],
  toggles: { verified: false, closing: false, recent: false },
  sort: '',
};

const list = <T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] =>
  (params.get(key) ?? '').split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));

/** The URL is the single source of truth for filters, so they survive navigation, refresh and sharing. */
function readFilters(params: URLSearchParams): Filters {
  const dur = params.get('dur');
  const exp = params.get('exp') ?? (params.get('beginner') === '1' ? 'none' : '');
  const pay = params.get('pay') ?? (params.get('paid') === '1' ? 'paid' : '');
  const sort = params.get('sort') as Sort | null;
  return {
    q: params.get('q') ?? '',
    field: list(params, 'field', FIELDS),
    area: params.get('area') ?? '',
    mode: list(params, 'mode', WORK_MODES),
    pay: pay === 'paid' || PAY_STEPS.map(String).includes(pay) ? pay : '',
    dur: dur === 'short' || dur === 'long' ? dur : '',
    exp: exp === 'none' || exp === 'some' ? exp : '',
    industry: list(params, 'industry', INDUSTRIES),
    stage: list(params, 'stage', COMPANY_KINDS),
    toggles: Object.fromEntries(TOGGLES.map((k) => [k, params.get(k) === '1'])) as Record<Toggle, boolean>,
    sort: sort && SORTS.includes(sort) ? sort : '',
  };
}

function writeFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q);
  if (f.field.length) p.set('field', f.field.join(','));
  if (f.area) p.set('area', f.area);
  if (f.mode.length) p.set('mode', f.mode.join(','));
  if (f.pay) p.set('pay', f.pay);
  if (f.dur) p.set('dur', f.dur);
  if (f.exp) p.set('exp', f.exp);
  if (f.industry.length) p.set('industry', f.industry.join(','));
  if (f.stage.length) p.set('stage', f.stage.join(','));
  TOGGLES.forEach((k) => f.toggles[k] && p.set(k, '1'));
  if (f.sort) p.set('sort', f.sort);
  return p;
}

const activeCount = (f: Filters) =>
  f.field.length +
  f.mode.length +
  f.industry.length +
  f.stage.length +
  (f.area ? 1 : 0) +
  (f.pay ? 1 : 0) +
  (f.dur ? 1 : 0) +
  (f.exp ? 1 : 0) +
  TOGGLES.filter((k) => f.toggles[k]).length;

function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="chips">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

function FilterPanel({ f, set, areas, idPrefix }: { f: Filters; set: (next: Filters) => void; areas: string[]; idPrefix: string }) {
  const t = useT();
  const b = t.pub.browse;
  const [allFields, setAllFields] = useState(false);
  const fields = allFields ? FIELDS : FIELDS.filter((x, i) => i < 8 || f.field.includes(x));
  return (
    <div className="filter-panel">
      <FilterGroup title={b.groups.quick}>
        {TOGGLES.map((k) => (
          <Chip key={k} on={f.toggles[k]} onClick={() => set({ ...f, toggles: { ...f.toggles, [k]: !f.toggles[k] } })}>
            {b.quick[k]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title={b.groups.industry}>
        {INDUSTRIES.map((id) => (
          <Chip key={id} on={f.industry.includes(id)} onClick={() => set({ ...f, industry: toggleIn(f.industry, id) })}>
            {t.industries[id]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title={b.groups.stage}>
        {COMPANY_KINDS.map((id) => (
          <Chip key={id} on={f.stage.includes(id)} onClick={() => set({ ...f, stage: toggleIn(f.stage, id) })}>
            {t.companyKinds[id]}
          </Chip>
        ))}
      </FilterGroup>

      <div className="filter-group">
        <label className="filter-label" htmlFor={`${idPrefix}-area`}>
          {b.groups.location}
        </label>
        <select id={`${idPrefix}-area`} className="select" value={f.area} onChange={(e) => set({ ...f, area: e.target.value })}>
          <option value="">{b.anyArea}</option>
          <option value="remote">{b.remoteOnly}</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <FilterGroup title={b.groups.field}>
        {fields.map((id) => (
          <Chip key={id} on={f.field.includes(id)} onClick={() => set({ ...f, field: toggleIn(f.field, id) })}>
            {t.fields[id]}
          </Chip>
        ))}
        <button type="button" className="link-arrow" onClick={() => setAllFields((v) => !v)}>
          {allFields ? b.showFewer : b.showAll(FIELDS.length)}
        </button>
      </FilterGroup>

      <div className="filter-group">
        <label className="filter-label" htmlFor={`${idPrefix}-pay`}>
          {b.groups.pay}
        </label>
        <select id={`${idPrefix}-pay`} className="select" value={f.pay} onChange={(e) => set({ ...f, pay: e.target.value })}>
          <option value="">{b.payAny}</option>
          <option value="paid">{b.payPaid}</option>
          {PAY_STEPS.map((n) => (
            <option key={n} value={n}>
              {b.payMin(formatBaht(n))}
            </option>
          ))}
        </select>
      </div>

      <FilterGroup title={b.groups.experience}>
        {(['none', 'some'] as const).map((id) => (
          <Chip key={id} on={f.exp === id} onClick={() => set({ ...f, exp: f.exp === id ? '' : id })}>
            {b.exp[id]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title={b.groups.mode}>
        {WORK_MODES.map((id) => (
          <Chip key={id} on={f.mode.includes(id)} onClick={() => set({ ...f, mode: toggleIn(f.mode, id) })}>
            {t.workModes[id]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title={b.groups.duration}>
        {(['short', 'long'] as const).map((id) => (
          <Chip key={id} on={f.dur === id} onClick={() => set({ ...f, dur: f.dur === id ? '' : id })}>
            {b.durations[id]}
          </Chip>
        ))}
      </FilterGroup>

    </div>
  );
}

export function matchesFilters(listing: Listing, f: Filters, db: ReturnType<typeof useSession>['db'], t: ReturnType<typeof useT>): boolean {
  const s = startupOf(db, listing);
  const q = f.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      listing.title,
      listing.summary,
      s?.name ?? '',
      t.fields[listing.field],
      s ? t.industries[s.industry] : '',
      s ? t.companyKinds[s.kind] : '',
      listing.district,
      t.workModes[listing.workMode],
      ...listing.skills.map((id) => t.skills[id as SkillId] ?? id),
    ]
      .join(' ')
      .toLowerCase();
    if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
  }
  if (f.field.length && !f.field.includes(listing.field)) return false;
  if (f.area === 'remote' && listing.workMode !== 'remote') return false;
  if (f.area && f.area !== 'remote' && (listing.workMode === 'remote' || listing.district !== f.area)) return false;
  if (f.mode.length && !f.mode.includes(listing.workMode)) return false;
  if (f.industry.length && (!s || !f.industry.includes(s.industry))) return false;
  if (f.stage.length && (!s || !f.stage.includes(s.kind))) return false;
  if (f.pay === 'paid' && !listing.paid) return false;
  if (f.pay && f.pay !== 'paid' && (listing.stipendMonthly ?? 0) < Number(f.pay)) return false;
  if (f.dur === 'short' && listing.durationMonths > 3) return false;
  if (f.dur === 'long' && listing.durationMonths < 4) return false;
  if (f.exp === 'none' && !listing.noExperienceRequired) return false;
  if (f.exp === 'some' && listing.noExperienceRequired) return false;
  if (f.toggles.verified && listingStatus(db, listing) !== 'verified') return false;
  if (f.toggles.closing && !isClosingSoon(listing)) return false;
  if (f.toggles.recent && !isNew(listing)) return false;
  return true;
}

export default function Browse() {
  const t = useT();
  const b = t.pub.browse;
  const [params, setParams] = useSearchParams();
  const { db, user, student, viewerKey } = useSession();
  const [sheet, setSheet] = useState(false);
  const loading = useDemoLoading('browse');

  const f = useMemo(() => readFilters(params), [params]);
  const set = (next: Filters) => setParams(writeFilters(next), { replace: true, preventScrollReset: true });
  const clearFilters = () => set({ ...EMPTY, q: f.q, sort: f.sort });

  const canMatch = !!student && profileCompleteness(student).done >= 4;
  const sort: Sort = f.sort && (f.sort !== 'match' || canMatch) ? f.sort : canMatch ? 'match' : 'newest';
  const open = useMemo(() => db.listings.filter(isOpen), [db.listings]);
  const areas = useMemo(() => [...new Set(open.filter((l) => l.workMode !== 'remote').map((l) => l.district))].sort(), [open]);

  const results = useMemo(() => {
    const rows = open.filter((l) => matchesFilters(l, f, db, t)).map((l) => ({ l, m: matchFor(db, student, l) }));
    const by: Record<Sort, (a: (typeof rows)[number], c: (typeof rows)[number]) => number> = {
      match: (a, c) => (c.m?.score ?? -1) - (a.m?.score ?? -1) || a.l.deadline.localeCompare(c.l.deadline),
      newest: (a, c) => c.l.postedAt.localeCompare(a.l.postedAt),
      deadline: (a, c) => a.l.deadline.localeCompare(c.l.deadline),
      az: (a, c) => a.l.title.localeCompare(c.l.title),
      stipend: (a, c) => (c.l.stipendMonthly ?? 0) - (a.l.stipendMonthly ?? 0),
    };
    return rows.sort(by[sort]);
  }, [db, f, open, sort, student, t]);

  const recent = (db.recentlyViewed[viewerKey] ?? [])
    .map((id) => db.listings.find((l) => l.id === id))
    .filter((l): l is Listing => !!l)
    .slice(0, 4);

  const count = activeCount(f);

  // One removable chip per active filter.
  const active: { key: string; label: string; clear: () => void }[] = [
    ...TOGGLES.filter((k) => f.toggles[k]).map((k) => ({
      key: k,
      label: b.quick[k],
      clear: () => set({ ...f, toggles: { ...f.toggles, [k]: false } }),
    })),
    ...(f.area ? [{ key: 'area', label: f.area === 'remote' ? b.remoteOnly : f.area, clear: () => set({ ...f, area: '' }) }] : []),
    ...f.field.map((id) => ({ key: id, label: t.fields[id], clear: () => set({ ...f, field: toggleIn(f.field, id) }) })),
    ...(f.pay
      ? [{ key: 'pay', label: f.pay === 'paid' ? b.payPaid : b.payMin(formatBaht(Number(f.pay))), clear: () => set({ ...f, pay: '' }) }]
      : []),
    ...(f.exp ? [{ key: 'exp', label: b.exp[f.exp], clear: () => set({ ...f, exp: '' }) }] : []),
    ...f.mode.map((id) => ({ key: id, label: t.workModes[id], clear: () => set({ ...f, mode: toggleIn(f.mode, id) }) })),
    ...(f.dur ? [{ key: 'dur', label: b.durations[f.dur], clear: () => set({ ...f, dur: '' }) }] : []),
    ...f.industry.map((id) => ({ key: id, label: t.industries[id], clear: () => set({ ...f, industry: toggleIn(f.industry, id) }) })),
    ...f.stage.map((id) => ({ key: id, label: t.companyKinds[id], clear: () => set({ ...f, stage: toggleIn(f.stage, id) }) })),
  ];

  const quickRow: { label: string; on: boolean; toggle: () => void }[] = [
    { label: b.exp.none, on: f.exp === 'none', toggle: () => set({ ...f, exp: f.exp === 'none' ? '' : 'none' }) },
    { label: b.payPaid, on: f.pay === 'paid', toggle: () => set({ ...f, pay: f.pay === 'paid' ? '' : 'paid' }) },
    { label: t.workModes.remote, on: f.mode.includes('remote'), toggle: () => set({ ...f, mode: toggleIn(f.mode, 'remote') }) },
    { label: b.quick.verified, on: f.toggles.verified, toggle: () => set({ ...f, toggles: { ...f.toggles, verified: !f.toggles.verified } }) },
    { label: b.quick.closing, on: f.toggles.closing, toggle: () => set({ ...f, toggles: { ...f.toggles, closing: !f.toggles.closing } }) },
  ];

  return (
    <div className="container page">
      <PageHead title={b.title} lead={b.lead} />

      <div className="browse-search">
        <div className="search-input">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="browse-q" className="sr-only">
            {b.searchLabel}
          </label>
          <input
            id="browse-q"
            type="search"
            value={f.q}
            onChange={(e) => set({ ...f, q: e.target.value })}
            placeholder={b.searchPlaceholder}
            autoComplete="off"
          />
          {f.q && (
            <button type="button" className="icon-btn" aria-label={t.actions.clear} onClick={() => set({ ...f, q: '' })}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <Button className="browse-filter-btn" icon={<SlidersHorizontal size={16} aria-hidden="true" />} onClick={() => setSheet(true)}>
          {b.filtersCount(count)}
        </Button>
      </div>

      <div className="quick-filters" role="group" aria-label={b.groups.quick}>
        {quickRow.map((c) => (
          <Chip key={c.label} on={c.on} onClick={c.toggle}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="browse-layout">
        <aside className="browse-side" aria-label={b.filters}>
          <div className="spread" style={{ marginBottom: 12 }}>
            <h2 className="eyebrow">{b.filters}</h2>
            {count > 0 && (
              <button type="button" className="link-arrow" onClick={clearFilters}>
                {b.clearAll}
              </button>
            )}
          </div>
          <FilterPanel f={f} set={set} areas={areas} idPrefix="side" />
        </aside>

        <section aria-label={b.title} className="grow">
          <div className="browse-bar">
            <p aria-live="polite" className="browse-count">
              {loading ? b.loading : b.results(results.length)}
            </p>
            <label className="row small">
              <span className="muted">{b.sort}</span>
              <select className="select select-sm" value={sort} onChange={(e) => set({ ...f, sort: e.target.value as Sort })}>
                {SORTS.filter((s) => s !== 'match' || canMatch).map((s) => (
                  <option key={s} value={s}>
                    {b.sortOptions[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {active.length > 0 && (
            <div className="active-filters">
              {active.map((a) => (
                <button key={a.key} type="button" className="chip is-on" onClick={a.clear} aria-label={`${t.actions.remove}: ${a.label}`}>
                  {a.label} <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="link-arrow" onClick={clearFilters}>
                {b.clearAll}
              </button>
            </div>
          )}

          {!user && (
            <div className="notice notice-info" style={{ marginBottom: 16 }}>
              <span className="grow">{b.signedOutHint}</span>
              <ButtonLink to="/signin?tab=create" size="sm">
                {b.createProfile}
              </ButtonLink>
            </div>
          )}
          {student && !canMatch && (
            <div className="notice notice-info" style={{ marginBottom: 16 }}>
              <span className="grow">{b.matchHint}</span>
              <ButtonLink to="/profile" size="sm">
                {t.match.completeProfile}
              </ButtonLink>
            </div>
          )}

          {loading ? (
            <div className="card-grid cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <InternshipCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState icon={<SearchX size={22} />} title={b.emptyTitle} body={b.emptyBody}>
              <Button variant="primary" onClick={() => set(EMPTY)}>
                {b.clearAll}
              </Button>
            </EmptyState>
          ) : (
            <div className="card-grid cols-2">
              {results.map(({ l, m }) => (
                <InternshipCard key={l.id} listing={l} match={m} />
              ))}
            </div>
          )}

          {recent.length > 0 && (
            <section className="section" style={{ marginBottom: 0 }}>
              <h2 className="eyebrow" style={{ marginBottom: 8 }}>
                {b.recentlyViewed}
              </h2>
              <div className="card irow-list">
                {recent.map((l) => (
                  <InternshipRow key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </section>
      </div>

      {sheet && (
        <Dialog
          title={b.filters}
          onClose={() => setSheet(false)}
          footer={
            <>
              <Button onClick={clearFilters} disabled={count === 0}>
                {b.clearAll}
              </Button>
              <Button variant="primary" onClick={() => setSheet(false)}>
                {b.showResults(results.length)}
              </Button>
            </>
          }
        >
          <FilterPanel f={f} set={set} areas={areas} idPrefix="sheet" />
        </Dialog>
      )}
    </div>
  );
}
