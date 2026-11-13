import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, BadgeCheck, CalendarClock, CircleCheck, FileText, MessageSquare, Star } from 'lucide-react';
import { formatDate, formatDateTime } from '../../domain/dates';
import type { Application } from '../../domain/types';
import { Timeline } from '../../components/application';
import { InternshipRow } from '../../components/listing';
import { ResumeFile } from '../../components/resume';
import { Stars } from '../../components/reviews';
import { StatusPill, TrustBadge } from '../../components/trust';
import { Button, ButtonLink, ConfirmDialog, EmptyState, Field, useToast } from '../../components/ui';
import { CompanyLogo } from '../../components/CompanyLogo';
import { demoLatency, studentSetStatus, submitReview } from '../../data/actions';
import { applicationFor, isOpen, listingStatus, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const t = useT();
  return (
    <fieldset className="field">
      <legend className="label">{label}</legend>
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= value ? 'is-on' : ''}>
            <input type="radio" className="sr-only" name={label} checked={value === n} onChange={() => onChange(n)} />
            <Star size={26} aria-hidden="true" fill={n <= value ? 'currentColor' : 'none'} />
            <span className="sr-only">{t.stu.application.stars(n)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewForm({ application }: { application: Application }) {
  const t = useT();
  const a = t.stu.application;
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [meaningfulWork, setMeaningful] = useState(0);
  const [mentorship, setMentorship] = useState(0);
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!rating || !meaningfulWork || !mentorship) next.rating = a.ratingError;
    if (body.trim().length < 60) next.body = t.errors.minChars(60);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await demoLatency();
    const ok = submitReview(application.id, { rating, meaningfulWork, mentorship, body: body.trim() });
    setBusy(false);
    toast(ok ? a.reviewDone : t.errors.generic, { kind: ok ? 'success' : 'error' });
  };

  return (
    <form className="card card-pad form-section" onSubmit={submit} noValidate>
      <div>
        <h2 className="card-title">{a.reviewTitle}</h2>
        <p className="small muted">{a.reviewLead}</p>
      </div>
      <RatingInput label={a.reviewOverall} value={rating} onChange={setRating} />
      <RatingInput label={a.reviewMeaningful} value={meaningfulWork} onChange={setMeaningful} />
      <RatingInput label={a.reviewMentorship} value={mentorship} onChange={setMentorship} />
      {errors.rating && (
        <p className="error-text" role="alert">
          {errors.rating}
        </p>
      )}
      <Field label={a.reviewBody} help={a.reviewBodyHelp} error={errors.body}>
        {(p) => <textarea {...p} className="textarea" maxLength={1200} value={body} onChange={(e) => setBody(e.target.value)} />}
      </Field>
      <div>
        <Button type="submit" variant="primary" loading={busy} loadingText={t.actions.submitting}>
          {a.reviewSubmit}
        </Button>
      </div>
    </form>
  );
}

export default function ApplicationDetail() {
  const t = useT();
  const a = t.stu.application;
  const { id } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();
  const { db, student } = useSession();
  const [confirm, setConfirm] = useState<'withdraw' | 'accept' | 'decline' | null>(null);
  const application = db.applications.find((x) => x.id === id && x.studentId === student?.id);
  const listing = application && db.listings.find((l) => l.id === application.listingId);
  const startup = application && db.startups.find((s) => s.id === application.startupId);

  if (!student) return null;
  if (!application || !listing || !startup) {
    return (
      <div className="container page">
        <EmptyState icon={<FileText size={22} />} title={a.notFoundTitle} body={a.notFoundBody}>
          <ButtonLink to="/applications" variant="primary">
            {a.back}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  if (application.status === 'draft') return <Navigate to={`/internships/${application.listingId}/apply`} replace />;
  const status = application.status;
  const canWithdraw = ['submitted', 'in_review', 'interview', 'offer'].includes(status);
  const latestMessage = [...application.events].reverse().find((e) => e.actor === 'startup' && e.message);
  const review = db.reviews.find((r) => r.applicationId === application.id);
  const similar =
    status === 'rejected'
      ? db.listings
          .filter((l) => l.id !== listing.id && l.field === listing.field && isOpen(l) && !applicationFor(db, student.id, l.id))
          .slice(0, 3)
      : [];

  const confirmCopy = {
    withdraw: { title: a.withdrawTitle, body: a.withdrawBody, label: a.withdraw, done: a.withdrawn, status: 'withdrawn' as const, danger: true },
    accept: { title: a.acceptTitle, body: a.acceptBody, label: a.accept, done: a.accepted, status: 'accepted' as const, danger: false },
    decline: { title: a.declineTitle, body: a.declineBody, label: a.decline, done: a.declined, status: 'declined' as const, danger: true },
  };

  return (
    <div className="container page">
      <Link to="/applications" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {a.back}
      </Link>

      {params.get('submitted') === '1' && status === 'submitted' && (
        <div className="notice notice-success confirm-banner" role="status">
          <CircleCheck size={22} aria-hidden="true" />
          <div>
            <strong>{a.submittedTitle}</strong>
            <p>{a.submittedBody(startup.name)}</p>
          </div>
        </div>
      )}

      <header className="detail-head">
        <CompanyLogo company={startup} size={64} />
        <div className="grow">
          <h1>{listing.title}</h1>
          <p className="detail-company">
            <Link to={`/companies/${startup.id}`} className="link">
              {startup.name}
            </Link>
            <span className="muted"> · {t.stu.applications.appliedOn(formatDate(application.appliedAt))}</span>
          </p>
          <div className="row-wrap" style={{ marginTop: 10 }}>
            <StatusPill status={status} />
            <TrustBadge status={listingStatus(db, listing)} kind="listing" />
            <span className="tag tag-demo">{a.demoTag}</span>
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="card card-pad next-card">
            <p className="eyebrow">{a.nextTitle}</p>
            <p className="next-text">{a.next[status]}</p>
            {status === 'offer' && (
              <div className="row-wrap" style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={() => setConfirm('accept')}>
                  {a.accept}
                </Button>
                <Button onClick={() => setConfirm('decline')}>{a.decline}</Button>
              </div>
            )}
          </section>

          {application.interview && ['interview', 'offer', 'accepted'].includes(status) && (
            <section className="card card-pad">
              <h2 className="card-title row">
                <CalendarClock size={18} aria-hidden="true" style={{ color: 'var(--amber)' }} />
                {a.interviewTitle}
              </h2>
              <dl className="facts" style={{ marginTop: 8 }}>
                <div>
                  <dt>{a.interviewWhen}</dt>
                  <dd>{formatDateTime(application.interview.at)}</dd>
                </div>
                <div>
                  <dt>{a.interviewMode}</dt>
                  <dd>{a.interviewModes[application.interview.mode]}</dd>
                </div>
                <div>
                  <dt>{a.interviewWhere}</dt>
                  <dd>{application.interview.place}</dd>
                </div>
                <div>
                  <dt>{a.interviewWith}</dt>
                  <dd>{application.interview.withName}</dd>
                </div>
                {application.interview.note && (
                  <div>
                    <dt>{a.interviewNote}</dt>
                    <dd>{application.interview.note}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="card card-pad">
            <h2 className="card-title row">
              <MessageSquare size={18} aria-hidden="true" style={{ color: 'var(--brand)' }} />
              {a.responseTitle}
            </h2>
            {latestMessage ? (
              <blockquote className="company-message">
                <p>{latestMessage.message}</p>
                <footer className="small muted">
                  {startup.name} · {formatDateTime(latestMessage.at)}
                </footer>
              </blockquote>
            ) : (
              <p className="muted" style={{ marginTop: 8 }}>
                {a.noResponse}
              </p>
            )}
          </section>

          {status === 'completed' &&
            (review ? (
              <section className="card card-pad">
                <h2 className="card-title row">
                  <BadgeCheck size={18} aria-hidden="true" style={{ color: 'var(--brand)' }} />
                  {a.reviewPublished}
                </h2>
                <div style={{ marginTop: 8 }}>
                  <Stars value={review.rating} />
                </div>
                <p style={{ marginTop: 8 }}>{review.body}</p>
              </section>
            ) : (
              <ReviewForm application={application} />
            ))}

          <section className="card card-pad">
            <h2 className="card-title">{a.yourApplication}</h2>
            <dl className="facts stacked" style={{ marginTop: 8 }}>
              <div>
                <dt>{a.motivation}</dt>
                <dd>{application.motivation}</dd>
              </div>
              <div>
                <dt>{a.availableFrom}</dt>
                <dd>{application.availableFrom}</dd>
              </div>
              <div>
                <dt>{a.resumeAttached}</dt>
                <dd>{application.resume ? <ResumeFile file={application.resume} /> : <span className="muted">{a.noResume}</span>}</dd>
              </div>
              {application.portfolioUrl && (
                <div>
                  <dt>{a.portfolio}</dt>
                  <dd className="truncate">{application.portfolioUrl}</dd>
                </div>
              )}
            </dl>
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="eyebrow" style={{ marginBottom: 8 }}>
                {a.similar}
              </h2>
              <div className="card irow-list">
                {similar.map((l) => (
                  <InternshipRow key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="detail-side">
          <section className="card card-pad">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              {a.timelineTitle}
            </h2>
            <Timeline application={application} viewer="student" />
          </section>
          <ButtonLink to={`/internships/${listing.id}`} block>
            {a.viewListing}
          </ButtonLink>
          {canWithdraw && (
            <Button variant="danger" block onClick={() => setConfirm('withdraw')}>
              {a.withdraw}
            </Button>
          )}
        </aside>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirmCopy[confirm].title}
          body={confirmCopy[confirm].body}
          confirmLabel={confirmCopy[confirm].label}
          danger={confirmCopy[confirm].danger}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            studentSetStatus(application.id, confirmCopy[confirm].status);
            toast(confirmCopy[confirm].done);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
