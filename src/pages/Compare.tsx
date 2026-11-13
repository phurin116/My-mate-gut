import { Link } from 'react-router';
import { Plus, Scale, X } from 'lucide-react';
import type { SkillId } from '../domain/catalog';
import { formatDate } from '../domain/dates';
import type { Listing } from '../domain/types';
import { DeadlineTag, stipendText } from '../components/listing';
import { MatchRing } from '../components/match';
import { TrustBadge } from '../components/trust';
import { Button, ButtonLink, EmptyState, Monogram, PageHead } from '../components/ui';
import { clearCompare, toggleCompare } from '../data/actions';
import { applicationFor, isOpen, listingStatus, matchFor, startupOf, useSession } from '../data/selectors';
import { useT } from '../i18n';

export default function Compare() {
  const t = useT();
  const c = t.pub.compare;
  const { db, user, student } = useSession();
  const listings = db.compare.map((id) => db.listings.find((l) => l.id === id)).filter((l): l is Listing => !!l);

  if (listings.length === 0) {
    return (
      <div className="container page">
        <PageHead title={c.title} lead={c.lead} />
        <EmptyState icon={<Scale size={22} />} title={c.emptyTitle} body={c.emptyBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const rows: [string, (l: Listing) => React.ReactNode][] = [
    [c.rows.verification, (l) => <TrustBadge status={listingStatus(db, l)} kind="listing" showTip={false} />],
    ...(student
      ? ([
          [
            c.rows.match,
            (l: Listing) => {
              const m = matchFor(db, student, l);
              return m?.score != null ? (
                <span className="row">
                  <MatchRing score={m.score} size={40} />
                  {!m.eligible && <span className="tag tag-amber">{t.listing.notEligible}</span>}
                </span>
              ) : (
                <span className="muted">{c.noScore}</span>
              );
            },
          ],
        ] as [string, (l: Listing) => React.ReactNode][])
      : []),
    [c.rows.stipend, (l) => <strong>{stipendText(t, l)}</strong>],
    [c.rows.deadline, (l) => <DeadlineTag listing={l} />],
    [c.rows.arrangement, (l) => t.workModes[l.workMode]],
    [c.rows.location, (l) => (l.workMode === 'remote' ? t.workModes.remote : l.district)],
    [c.rows.duration, (l) => t.listing.months(l.durationMonths)],
    [c.rows.hours, (l) => String(l.hoursPerWeek)],
    [c.rows.start, (l) => formatDate(l.startDate)],
    [
      c.rows.experience,
      (l) =>
        l.noExperienceRequired ? (
          <span className="tag tag-green">{t.listing.noExperience}</span>
        ) : (
          <span className="tag tag-outline">{t.listing.experienceNeeded}</span>
        ),
    ],
    [c.rows.eligibility, (l) => t.listing.minYear(l.minYear)],
    [
      c.rows.skills,
      (l) => (
        <span className="row-wrap" style={{ gap: 4 }}>
          {l.skills.map((s) => (
            <span key={s} className={`tag${student?.skills.includes(s) ? ' tag-green' : ''}`}>
              {t.skills[s as SkillId] ?? s}
            </span>
          ))}
        </span>
      ),
    ],
    [c.rows.supervisor, (l) => l.supervisorName || <span className="muted">{c.notNamed}</span>],
  ];

  return (
    <div className="container page">
      <PageHead
        title={c.title}
        lead={c.lead}
        actions={
          <Button size="sm" onClick={clearCompare}>
            {c.clear}
          </Button>
        }
      />
      <div className="card table-wrap">
        <table className="table compare-table">
          <thead>
            <tr>
              <td />
              {listings.map((l) => {
                const s = startupOf(db, l);
                return (
                  <th key={l.id} scope="col">
                    <div className="compare-head">
                      <div className="spread">
                        <Monogram name={s?.name ?? '?'} hue={s?.hue ?? 0} size="sm" />
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`${c.remove}: ${l.title}`}
                          onClick={() => toggleCompare(l.id)}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <Link to={`/internships/${l.id}`} className="compare-title">
                        {l.title}
                      </Link>
                      <span className="compare-company">{s?.name}</span>
                    </div>
                  </th>
                );
              })}
              {listings.length < 3 && (
                <th scope="col" className="compare-add">
                  <Link to="/internships" className="link-arrow">
                    <Plus size={14} aria-hidden="true" />
                    {c.addMore}
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {listings.map((l) => (
                  <td key={l.id}>{render(l)}</td>
                ))}
                {listings.length < 3 && <td />}
              </tr>
            ))}
            <tr>
              <th scope="row" />
              {listings.map((l) => {
                const app = student ? applicationFor(db, student.id, l.id) : undefined;
                return (
                  <td key={l.id}>
                    {app ? (
                      <ButtonLink to={`/applications/${app.id}`} size="sm">
                        {t.pub.detail.viewApplication}
                      </ButtonLink>
                    ) : isOpen(l) && (!user || user.role === 'student') ? (
                      <ButtonLink to={user ? `/internships/${l.id}/apply` : `/internships/${l.id}`} variant="primary" size="sm">
                        {user ? t.pub.detail.applyShort : t.listing.viewDetails}
                      </ButtonLink>
                    ) : (
                      <ButtonLink to={`/internships/${l.id}`} size="sm">
                        {t.listing.viewDetails}
                      </ButtonLink>
                    )}
                  </td>
                );
              })}
              {listings.length < 3 && <td />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
