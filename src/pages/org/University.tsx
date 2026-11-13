import { Download, GraduationCap, Lock } from 'lucide-react';
import { FIELDS } from '../../domain/catalog';
import { formatDate, nowISO } from '../../domain/dates';
import { profileCompleteness } from '../../domain/matching';
import type { ApplicationStatus } from '../../domain/types';
import { TrustBadge } from '../../components/trust';
import { Button, EmptyState, Monogram, PageHead, useToast } from '../../components/ui';
import { listingStatus, startupStatus, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

const REACHED_INTERVIEW: ApplicationStatus[] = ['interview', 'offer', 'accepted', 'completed', 'declined'];
const REACHED_OFFER: ApplicationStatus[] = ['offer', 'accepted', 'completed', 'declined'];
const PLACED: ApplicationStatus[] = ['accepted', 'completed'];

export default function University() {
  const t = useT();
  const u = t.biz.university;
  const toast = useToast();
  const { db, user } = useSession();
  const university = db.universities.find((x) => x.id === user?.universityId);

  if (!university) {
    return (
      <div className="container page">
        <EmptyState icon={<GraduationCap size={22} />} title={u.noUniversity} body="" />
      </div>
    );
  }

  const students = db.students.filter((s) => s.universityId === university.id);
  const ids = new Set(students.map((s) => s.id));
  const applications = db.applications.filter((a) => ids.has(a.studentId));
  // An application counts for a stage if it ever reached it, not only if it is there now.
  const reached = (statuses: ApplicationStatus[]) =>
    applications.filter((a) => a.events.some((e) => statuses.includes(e.status))).length;

  const metrics: [string, number][] = [
    [u.metrics.students, students.length],
    [u.metrics.profiles, students.filter((s) => profileCompleteness(s).done === profileCompleteness(s).total).length],
    [u.metrics.applicants, new Set(applications.map((a) => a.studentId)).size],
    [u.metrics.applications, applications.length],
    [u.metrics.interviews, reached(REACHED_INTERVIEW)],
    [u.metrics.offers, reached(REACHED_OFFER)],
    [u.metrics.placements, reached(PLACED)],
  ];

  const funnel: [string, number][] = [
    [u.metrics.applications, applications.length],
    [u.metrics.interviews, reached(REACHED_INTERVIEW)],
    [u.metrics.offers, reached(REACHED_OFFER)],
    [u.metrics.placements, reached(PLACED)],
  ];
  const funnelMax = Math.max(1, applications.length);

  const byField = FIELDS.map((f) => ({
    field: f,
    count: applications.filter((a) => db.listings.find((l) => l.id === a.listingId)?.field === f).length,
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const fieldMax = Math.max(1, ...byField.map((x) => x.count));

  const byStartup = db.startups
    .map((s) => ({ startup: s, count: applications.filter((a) => a.startupId === s.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const verifiedShare = applications.length
    ? Math.round(
        (applications.filter((a) => {
          const l = db.listings.find((x) => x.id === a.listingId);
          return l && listingStatus(db, l) === 'verified';
        }).length /
          applications.length) *
          100,
      )
    : 0;

  const exportCsv = async () => {
    const rows: (string | number)[][] = [
      ['Section', 'Item', 'Value'],
      ...metrics.map(([k, v]) => ['Summary', k, v]),
      ...byField.map((x) => ['Applications by area', t.fields[x.field], x.count]),
      ...byStartup.map((x) => ['Applications by startup', x.startup.name, x.count]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const filename = `placement-report-${nowISO().slice(0, 10)}.csv`;

    // Inside the Claude artifact viewer, files must be offered through its downloads capability.
    const host = (window as unknown as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
    if (host?.use) {
      const downloads = (await host.use('downloads')) as {
        save: (r: { filename: string; data: string }) => Promise<unknown>;
      } | null;
      if (downloads) {
        try {
          await downloads.save({ filename, data: csv });
          toast(u.exported);
        } catch (e) {
          if ((e as { code?: string })?.code !== 'declined') toast(u.exportFailed, { kind: 'error' });
        }
        return;
      }
    }

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast(u.exported);
  };

  return (
    <div className="container page">
      <PageHead
        eyebrow={u.eyebrow}
        title={university.name}
        lead={`${u.lead} ${u.asOf(formatDate(nowISO()))}.`}
        actions={
          <Button icon={<Download size={16} aria-hidden="true" />} onClick={exportCsv} disabled={students.length === 0}>
            {u.export}
          </Button>
        }
      />

      {students.length === 0 ? (
        <EmptyState icon={<GraduationCap size={22} />} title={u.emptyTitle} body={u.emptyBody} />
      ) : (
        <>
          <ul className="stat-grid stat-grid-wide">
            {metrics.map(([label, value]) => (
              <li key={label} className="card stat">
                <span className="stat-value display">{value}</span>
                <span className="stat-label">{label}</span>
              </li>
            ))}
          </ul>

          <div className="two-col">
            <section className="card card-pad">
              <h2 className="card-title">{u.funnel}</h2>
              <p className="small muted">{u.funnelHelp}</p>
              <ul className="bars">
                {funnel.map(([label, value]) => (
                  <li key={label}>
                    <span className="bars-label">{label}</span>
                    <span className="bars-track" aria-hidden="true">
                      <span style={{ width: `${(value / funnelMax) * 100}%` }} />
                    </span>
                    <span className="bars-value">{value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card card-pad">
              <h2 className="card-title">{u.byField}</h2>
              {byField.length === 0 ? (
                <p className="muted small">{u.byFieldEmpty}</p>
              ) : (
                <ul className="bars">
                  {byField.map((x) => (
                    <li key={x.field}>
                      <span className="bars-label">{t.fields[x.field]}</span>
                      <span className="bars-track" aria-hidden="true">
                        <span style={{ width: `${(x.count / fieldMax) * 100}%` }} />
                      </span>
                      <span className="bars-value">{x.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="card" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h2 className="card-title">{u.startups}</h2>
              <span className="small muted">{u.verifiedShare(verifiedShare)}</span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">{u.startupCol}</th>
                    <th scope="col">{u.verificationCol}</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      {u.applicationsCol}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {byStartup.map(({ startup, count }) => (
                    <tr key={startup.id}>
                      <th scope="row">
                        <span className="row">
                          <Monogram name={startup.name} hue={startup.hue} size="sm" />
                          <span>{startup.name}</span>
                        </span>
                      </th>
                      <td>
                        <TrustBadge status={startupStatus(db, startup.id)} kind="company" showTip={false} />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="notice" style={{ color: 'var(--muted)', paddingInline: 0, marginTop: 16 }}>
            <Lock size={16} aria-hidden="true" />
            {u.privacy}
          </p>
        </>
      )}
    </div>
  );
}
