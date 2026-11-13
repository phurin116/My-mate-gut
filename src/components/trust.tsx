import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Flag, Minus, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { LISTING_CHECKS, REPORT_REASONS, STARTUP_CHECKS } from '../domain/catalog';
import { formatDate } from '../domain/dates';
import type {
  ApplicationStatus,
  ID,
  ReportReason,
  VerificationRecord,
  VerificationStatus,
  VerificationSubject,
} from '../domain/types';
import { demoLatency, submitReport } from '../data/actions';
import { useSession } from '../data/selectors';
import { useT } from '../i18n';
import { Button, Dialog, Field, Tooltip, useToast } from './ui';

const ICONS = { verified: ShieldCheck, pending: ShieldQuestion, unverified: ShieldAlert };

/** The only component allowed to render a verification state. It always takes the state from a record. */
export function TrustBadge({
  status,
  kind,
  showTip = true,
}: {
  status: VerificationStatus;
  kind: 'listing' | 'company';
  showTip?: boolean;
}) {
  const t = useT();
  const Icon = ICONS[status];
  const label = kind === 'listing' ? t.trust.listingBadge[status] : t.trust.companyBadge[status];
  const badge = (
    <span className={`badge badge-${status}`}>
      <Icon size={15} aria-hidden="true" />
      {label}
    </span>
  );
  return showTip ? <Tooltip text={t.trust.short[status]} align="start">{badge}</Tooltip> : badge;
}

/** Full checklist for one verification record, with dates. */
export function VerificationPanel({
  record,
  subject,
  isDemo,
}: {
  record: VerificationRecord | undefined;
  subject: VerificationSubject;
  isDemo: boolean;
}) {
  const t = useT();
  const status = record?.status ?? 'unverified';
  const checks = subject === 'startup' ? STARTUP_CHECKS : LISTING_CHECKS;
  return (
    <div className="stack" style={{ '--stack': '10px' } as React.CSSProperties}>
      <TrustBadge status={status} kind={subject === 'startup' ? 'company' : 'listing'} showTip={false} />
      <p className="small muted">{t.trust.short[status]}</p>
      <ul className="checklist small">
        {checks.map((id) => {
          const ok = !!record?.checks[id];
          return (
            <li key={id} className={ok ? '' : 'is-off'}>
              {ok ? <Check size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
              <span>
                {t.trust.checks[id]}
                <span className="sr-only">{ok ? ' (confirmed)' : ' (not confirmed)'}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="small muted">
        {record?.lastCheckedAt ? t.trust.lastChecked(formatDate(record.lastCheckedAt)) : t.trust.neverChecked}
        {record?.verifiedAt ? ` · ${t.trust.verifiedOn(formatDate(record.verifiedAt))}` : ''}
      </p>
      {isDemo && <p className="small muted">{t.trust.demoNote}</p>}
      <Link to="/trust" className="link-arrow">
        {t.nav.trust}
      </Link>
    </div>
  );
}

const STATUS_TONE: Record<ApplicationStatus, string> = {
  submitted: 'neutral',
  in_review: 'blue',
  interview: 'amber',
  offer: 'green',
  accepted: 'green',
  completed: 'green',
  declined: 'neutral',
  rejected: 'red',
  withdrawn: 'neutral',
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const t = useT();
  return <span className={`pill pill-${STATUS_TONE[status]}`}>{t.status[status]}</span>;
}

export function ReportButton({ subjectType, subjectId }: { subjectType: VerificationSubject; subjectId: ID }) {
  const t = useT();
  const toast = useToast();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('misleading');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (details.trim().length < 10) {
      setError(t.report.detailsError);
      return;
    }
    setBusy(true);
    await demoLatency();
    submitReport({ subjectType, subjectId, reason, details: details.trim(), reporterUserId: user?.id ?? null });
    setBusy(false);
    setOpen(false);
    setDetails('');
    setError('');
    toast(t.report.sent);
  };

  return (
    <>
      <button type="button" className="link-arrow muted" onClick={() => setOpen(true)} style={{ color: 'var(--muted)' }}>
        <Flag size={14} aria-hidden="true" />
        {subjectType === 'listing' ? t.report.listing : t.report.startup}
      </button>
      {open && (
        <Dialog
          title={subjectType === 'listing' ? t.report.titleListing : t.report.titleStartup}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button onClick={() => setOpen(false)}>{t.actions.cancel}</Button>
              <Button variant="primary" onClick={send} loading={busy}>
                {t.report.send}
              </Button>
            </>
          }
        >
          <div className="stack">
            <p className="muted small">{t.report.intro}</p>
            <Field label={t.report.reason}>
              {(p) => (
                <select
                  {...p}
                  className="select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  data-autofocus
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {t.reportReasons[r]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t.report.details} help={t.report.detailsHelp} error={error}>
              {(p) => (
                <textarea
                  {...p}
                  className="textarea"
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    setError('');
                  }}
                  maxLength={1000}
                />
              )}
            </Field>
          </div>
        </Dialog>
      )}
    </>
  );
}
