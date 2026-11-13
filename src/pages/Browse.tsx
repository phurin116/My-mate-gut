import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { FIELDS, INDUSTRIES, WORK_MODES, type SkillId } from '../domain/catalog';
import type { FieldId, IndustryId, Listing, WorkMode } from '../domain/types';
import { InternshipCard, InternshipCardSkeleton, InternshipRow } from '../components/listing';
import { Button, ButtonLink, Dialog, EmptyState, PageHead, useDemoLoading } from '../components/ui';
import { isClosingSoon, isNew, isOpen, listingStatus, matchFor, startupOf, useSession } from '../data/selectors';
import { profileCompleteness } from '../domain/matching';
import { useT } from '../i18n';

type Sort = 'match' | 'deadline' | 'newest' | 'stipend';
const TOGGLES = ['beginner', 'paid', 'verified', 'closing', 'recent'] as const;
type Toggle = (typeof TOGGLES)[number];

interface Filters {
  q: string;
  field: FieldId[];
  mode: WorkMode[];
  industry: IndustryId[];
  dur: '' | 'short' | 'long';
  toggles: Record<Toggle, boolean>;
  sort: Sort | '';
}

const list = <T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] =>
  (params.get(key) ?? '').split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));

/** The URL is the single source of truth for filters, so they survive navigation and can be shared. */
function readFilters(params: URLSearchParams): Filters {
  const dur = params.get('dur');
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    field: list(params, 'field', FIELDS),
    mode: list(params, 'mode', WORK_MODES),
    industry: list(params, 'industry', INDUSTRIES),
    dur: dur === 'short' || dur === 'long' ? dur : '',
    toggles: Object.fromEntries(TOGGLES.map((k) => [k, params.get(k) === '1'])) as Record<Toggle, boolean>,
    sort: sort === 'match' || sort === 'deadline' || sort === 'newest' || sort === 'stipend' ? sort : '',
  };
}

function writeFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q);
  if (f.field.length) p.set('field', f.field.join(','));
  if (f.mode.length) p.set('mode', f.mode.join(','));
  if (f.industry.length) p.set('industry', f.industry.join(','));
  if (f.dur) p.set('dur', f.dur);
  TOGGLES.forEach((k) => f.toggles[k] && p.set(k, '1'));
  if (f.sort) p.set('sort', f.sort);
  return p;
}

const activeCount = (f: Filters) =>
  f.field.length + f.mode.length + f.industry.length + (f.dur ? 1 : 0) + TOGGLES.filter((k) => f.toggles[k]).length;

function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="chips">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

function FilterPanel({ f, set }: { f: Filters; set: (next: Filters) => void }) {
  const t = useT();
  const b = t.pub.browse;
  const setToggle = (k: Toggle) => set({ ...f, toggles: { ...f.toggles, [k]: !f.toggles[k] } });
  return (
    <div className="filter-panel">
      <FilterGroup title={b.groups.more}>
        {TOGGLES.map((k) => (
          <Chip key={k} on={f.toggles[k]} onClick={() => setToggle(k)}>
            {b.quick[k]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title={b.groups.field}>
        {FIELDS.map((id) => (
          <Chip key={id} on={f.field.includes(id)} onClick={() => set({ ...f, field: toggleIn(f.field, id) })}>
            {t.fields[id]}
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
      <FilterGroup title={b.groups.industry}>
        {INDUSTRIES.map((id) => (
          <Chip key={id} on={f.industry.includes(id)} onClick={() => set({ ...f, industry: toggleIn(f.industry, id) })}>
            {t.industries[id]}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  );
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

  const canMatch = !!student && profileCompleteness(student).done >= 4;
  const sort: Sort = f.sort || (canMatch ? 'match' : 'deadline');

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const rows = db.listings
      .filter(isOpen)
      .filter((l) => {
        const s = startupOf(db, l);
        if (q) {
          const haystack = [
            l.title,
            l.summary,
            s?.name ?? '',
            t.fields[l.field],
            s ? t.industries[s.industry] : '',
            l.district,
            ...l.skills.map((id) => t.skills[id as SkillId] ?? id),
          ]
            .join(' ')
            .toLowerCase();
          if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
        }
        if (f.field.length && !f.field.includes(l.field)) return false;
        if (f.mode.length && !f.mode.includes(l.workMode)) return false;
        if (f.industry.length && (!s || !f.industry.includes(s.industry))) return false;
        if (f.dur === 'short' && l.durationMonths > 3) return false;
        if (f.dur === 'long' && l.durationMonths < 4) return false;
        if (f.toggles.beginner && !l.noExperienceRequired) return false;
        if (f.toggles.paid && !l.paid) return false;
        if (f.toggles.verified && listingStatus(db, l) !== 'verified') return false;
        if (f.toggles.closing && !isClosingSoon(l)) return false;
        if (f.toggles.recent && !isNew(l)) return false;
        return true;
      })
      .map((l) => ({ l, m: matchFor(db, student, l) }));

    const by: Record<Sort, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
      match: (a, c) => (c.m?.score ?? -1) - (a.m?.score ?? -1) || a.l.deadline.localeCompare(c.l.deadline),
      deadline: (a, c) => a.l.deadline.localeCompare(c.l.deadline),
      newest: (a, c) => c.l.postedAt.localeCompare(a.l.postedAt),
      stipend: (a, c) => (c.l.stipendMonthly ?? 0) - (a.l.stipendMonthly ?? 0),
    };
    return rows.sort(by[sort]);
  }, [db, f, sort, student, t]);

  const recent = (db.recentlyViewed[viewerKey] ?? [])
    .map((id) => db.listings.find((l) => l.id === id))
    .filter((l): l is Listing => !!l)
    .slice(0, 4);

  const count = activeCount(f);
  const clear = () => set({ ...readFilters(new URLSearchParams()), q: f.q, sort: f.sort });

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
        <Button
          className="browse-filter-btn"
          icon={<SlidersHorizontal size={16} aria-hidden="true" />}
          onClick={() => setSheet(true)}
        >
          {b.filtersCount(count)}
        </Button>
      </div>

      <div className="browse-layout">
        <aside className="browse-side" aria-label={b.filters}>
          <div className="spread" style={{ marginBottom: 12 }}>
            <h2 className="eyebrow">{b.filters}</h2>
            {count > 0 && (
              <button type="button" className="link-arrow" onClick={clear}>
                {b.clearAll}
              </button>
            )}
          </div>
          <FilterPanel f={f} set={set} />
        </aside>

        <section aria-label={b.title} className="grow">
          <div className="browse-bar">
            <p aria-live="polite" className="browse-count">
              {loading ? b.loading : b.results(results.length)}
            </p>
            <label className="row small">
              <span className="muted">{b.sort}</span>
              <select
                className="select select-sm"
                value={sort}
                onChange={(e) => set({ ...f, sort: e.target.value as Sort })}
              >
                {(['match', 'deadline', 'newest', 'stipend'] as const)
                  .filter((s) => s !== 'match' || canMatch)
                  .map((s) => (
                    <option key={s} value={s}>
                      {b.sortOptions[s]}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {count > 0 && (
            <div className="active-filters">
              {TOGGLES.filter((k) => f.toggles[k]).map((k) => (
                <button key={k} type="button" className="chip is-on" onClick={() => set({ ...f, toggles: { ...f.toggles, [k]: false } })}>
                  {b.quick[k]} <X size={13} aria-hidden="true" />
                </button>
              ))}
              {f.field.map((id) => (
                <button key={id} type="button" className="chip is-on" onClick={() => set({ ...f, field: toggleIn(f.field, id) })}>
                  {t.fields[id]} <X size={13} aria-hidden="true" />
                </button>
              ))}
              {f.mode.map((id) => (
                <button key={id} type="button" className="chip is-on" onClick={() => set({ ...f, mode: toggleIn(f.mode, id) })}>
                  {t.workModes[id]} <X size={13} aria-hidden="true" />
                </button>
              ))}
              {f.dur && (
                <button type="button" className="chip is-on" onClick={() => set({ ...f, dur: '' })}>
                  {b.durations[f.dur]} <X size={13} aria-hidden="true" />
                </button>
              )}
              {f.industry.map((id) => (
                <button key={id} type="button" className="chip is-on" onClick={() => set({ ...f, industry: toggleIn(f.industry, id) })}>
                  {t.industries[id]} <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="link-arrow" onClick={clear}>
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
              <Button variant="primary" onClick={() => set(readFilters(new URLSearchParams()))}>
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
              <Button onClick={clear} disabled={count === 0}>
                {b.clearAll}
              </Button>
              <Button variant="primary" onClick={() => setSheet(false)}>
                {b.showResults(results.length)}
              </Button>
            </>
          }
        >
          <FilterPanel f={f} set={set} />
        </Dialog>
      )}
    </div>
  );
}
