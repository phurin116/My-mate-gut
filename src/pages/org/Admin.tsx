import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ExternalLink, Flag, ShieldAlert, ShieldCheck } from 'lucide-react';
import { LISTING_CHECKS, STARTUP_CHECKS } from '../../domain/catalog';
import { formatDate } from '../../domain/dates';
import type { CheckId, Database, VerificationRecord } from '../../domain/types';
import { TrustBadge } from '../../components/trust';
import { Button, Dialog, EmptyState, Field, PageHead, useToast } from '../../components/ui';
import { demoLatency, resolveReport, setVerification } from '../../data/actions';
import { startupStatus, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

function describe(db: Database, r: { subjectType: 'startup' | 'listing'; subjectId: string }) {
  if (r.subjectType === 'startup') {
    const s = db.startups.find((x) => x.id === r.subjectId);
    return { name: s?.name ?? '–', link: `/companies/${r.subjectId}`, startup: s, company: '' };
  }
  const l = db.listings.find((x) => x.id === r.subjectId);
  const s = db.startups.find((x) => x.id === l?.startupId);
  return { name: l?.title ?? '–', link: `/internships/${r.subjectId}`, startup: s, company: s?.name ?? '' };
}

function ReviewDialog({ record, onClose }: { record: VerificationRecord; onClose: () => void }) {
  const t = useT();
  const a = t.biz.admin;
  const toast = useToast();
  const { db } = useSession();
  const ids: readonly CheckId[] = record.subjectType === 'startup' ? STARTUP_CHECKS : LISTING_CHECKS;
  const [checks, setChecks] = useState<Partial<Record<CheckId, boolean>>>(record.checks);
  const [note, setNote] = useState(record.reviewerNote);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const info = describe(db, record);
  const allChecked = ids.every((id) => checks[id]);
  const companyUnverified =
    record.subjectType === 'listing' && info.startup && startupStatus(db, info.startup.id) !== 'verified';

  const decide = async (approve: boolean) => {
    setBusy(approve ? 'approve' : 'reject');
    await demoLatency();
    setVerification(record.id, approve ? 'verified' : 'unverified', checks, note.trim());
    toast(approve ? (record.status === 'verified' ? a.rechecked : a.approved) : a.rejected);
    onClose();
  };

  return (
    <Dialog
      title={info.name}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="danger" onClick={() => decide(false)} loading={busy === 'reject'} disabled={busy !== null}>
            {record.status === 'verified' ? a.revoke : a.reject}
          </Button>
          <Button variant="primary" onClick={() => decide(true)} loading={busy === 'approve'} disabled={!allChecked || busy !== null}>
            {record.status === 'verified' ? a.recheck : a.approve}
          </Button>
        </>
      }
    >
      <div className="stack">
        <div className="row-wrap">
          <span className="tag">{record.subjectType === 'startup' ? a.company : a.listing}</span>
          <TrustBadge status={record.status} kind={record.subjectType === 'startup' ? 'company' : 'listing'} showTip={false} />
          <Link to={info.link} className="link-arrow" target="_blank" rel="noreferrer">
            {a.view}
            <ExternalLink size={13} aria-hidden="true" />
          </Link>
        </div>
        {info.company && <p className="small muted">{a.submittedBy(info.company)}</p>}
        {companyUnverified && (
          <div className="notice notice-warn">
            <ShieldAlert size={18} aria-hidden="true" />
            <p>{a.companyNotVerified}</p>
          </div>
        )}
        <fieldset>
          <legend className="label" style={{ marginBottom: 4 }}>
            {a.checklist}
          </legend>
          {ids.map((id) => (
            <label key={id} className="check">
              <input type="checkbox" checked={!!checks[id]} onChange={(e) => setChecks({ ...checks, [id]: e.target.checked })} />
              <span>{t.trust.checks[id]}</span>
            </label>
          ))}
        </fieldset>
        <Field label={a.note} help={a.noteHelp} optional>
          {(p) => <textarea {...p} className="textarea" style={{ minHeight: 84 }} maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        {!allChecked && <p className="small muted">{a.approveDisabled}</p>}
      </div>
    </Dialog>
  );
}

function RecordTable({ records, onReview }: { records: VerificationRecord[]; onReview: (r: VerificationRecord) => void }) {
  const t = useT();
  const a = t.biz.admin;
  const { db } = useSession();
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{a.subject}</th>
            <th scope="col">{a.status}</th>
            <th scope="col">{a.lastChecked}</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const info = describe(db, r);
            return (
              <tr key={r.id}>
                <th scope="row">
                  <span style={{ fontWeight: 600 }}>{info.name}</span>
                  <span className="small muted" style={{ display: 'block', fontWeight: 400 }}>
                    {r.subjectType === 'startup' ? a.company : `${a.listing} · ${info.company}`}
                  </span>
                </th>
                <td>
                  <TrustBadge status={r.status} kind={r.subjectType === 'startup' ? 'company' : 'listing'} showTip={false} />
                </td>
                <td className="muted">{r.lastCheckedAt ? formatDate(r.lastCheckedAt) : t.trust.neverChecked}</td>
                <td style={{ textAlign: 'right' }}>
                  <Button size="sm" onClick={() => onReview(r)}>
                    {a.edit}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  const t = useT();
  const a = t.biz.admin;
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const { db } = useSession();
  const [reviewing, setReviewing] = useState<VerificationRecord | null>(null);
  const tabParam = params.get('tab');
  const tab = tabParam === 'all' || tabParam === 'reports' ? tabParam : 'queue';

  // Companies before listings, because a listing cannot be verified ahead of its company.
  const order = (x: VerificationRecord, y: VerificationRecord) =>
    Number(y.subjectType === 'startup') - Number(x.subjectType === 'startup');
  const queue = db.verifications.filter((v) => v.status === 'pending').sort(order);
  const all = [...db.verifications].sort(order);
  const openReports = db.reports.filter((r) => r.status === 'open').length;

  return (
    <div className="container page">
      <PageHead title={a.title} lead={a.lead} />
      <div className="tabs" role="tablist" style={{ marginBottom: 16 }}>
        {(
          [
            ['queue', a.tabs.queue, queue.length],
            ['all', a.tabs.all, all.length],
            ['reports', a.tabs.reports, openReports],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="tab"
            onClick={() => setParams(id === 'queue' ? {} : { tab: id }, { replace: true })}
          >
            {label} <span className="count">{n}</span>
          </button>
        ))}
      </div>

      {tab === 'queue' &&
        (queue.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={22} />} title={a.queueEmptyTitle} body={a.queueEmptyBody} />
        ) : (
          <RecordTable records={queue} onReview={setReviewing} />
        ))}

      {tab === 'all' && <RecordTable records={all} onReview={setReviewing} />}

      {tab === 'reports' &&
        (db.reports.length === 0 ? (
          <EmptyState icon={<Flag size={22} />} title={a.reportsEmptyTitle} body={a.reportsEmptyBody} />
        ) : (
          <ul className="manage-list">
            {db.reports.map((r) => {
              const info = describe(db, r);
              const reporter = db.users.find((u) => u.id === r.reporterUserId);
              return (
                <li key={r.id} className="card card-pad stack" style={{ '--stack': '8px' } as React.CSSProperties}>
                  <div className="spread">
                    <span className="row-wrap">
                      <span className={`pill ${r.status === 'open' ? 'pill-amber' : 'pill-neutral'}`}>
                        {r.status === 'open' ? a.open : a.resolved}
                      </span>
                      <strong>{t.reportReasons[r.reason]}</strong>
                    </span>
                    <span className="small muted">{a.reportedOn(formatDate(r.createdAt))}</span>
                  </div>
                  <p>{r.details}</p>
                  <p className="small muted">
                    {r.subjectType === 'startup' ? a.company : a.listing}:{' '}
                    <Link to={info.link} className="link">
                      {info.name}
                    </Link>
                    {info.company ? ` (${info.company})` : ''} · {a.reporter}: {reporter?.name ?? a.anonymous}
                  </p>
                  {r.status === 'open' && (
                    <div className="row-wrap">
                      <Button
                        size="sm"
                        onClick={() => {
                          const record = db.verifications.find(
                            (v) => v.subjectType === r.subjectType && v.subjectId === r.subjectId,
                          );
                          if (record) setReviewing(record);
                        }}
                      >
                        {a.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          resolveReport(r.id);
                          toast(a.reportResolved);
                        }}
                      >
                        {a.resolve}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ))}

      {reviewing && <ReviewDialog record={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}
