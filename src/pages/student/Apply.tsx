import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, CircleAlert, FileCheck, Info, Minus, SearchX, ShieldAlert } from 'lucide-react';
import type { SkillId } from '../../domain/catalog';
import { formatDate, formatDateTime } from '../../domain/dates';
import { isUrl } from '../../domain/validate';
import { CompanyLogo } from '../../components/CompanyLogo';
import { DeadlineTag, stipendText } from '../../components/listing';
import { ResumeManager } from '../../components/resume';
import { TrustBadge } from '../../components/trust';
import { Button, ButtonLink, ConfirmDialog, EmptyState, Field, PageHead, useToast } from '../../components/ui';
import { applyToListing, deleteDraft, demoLatency, saveDraft } from '../../data/actions';
import { applicationFor, isOpen, listingStatus, matchFor, startupOf, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

const MIN_MOTIVATION = 80;

export default function Apply() {
  const t = useT();
  const a = t.stu.apply;
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { db, student } = useSession();
  const listing = db.listings.find((l) => l.id === id);
  const existing = student && listing ? applicationFor(db, student.id, listing.id) : undefined;
  const draft = existing?.status === 'draft' ? existing : undefined;

  const [motivation, setMotivation] = useState(draft?.motivation ?? '');
  const [availableFrom, setAvailableFrom] = useState(draft?.availableFrom ?? a.availableOptions[0]);
  const [portfolioUrl, setPortfolioUrl] = useState(draft?.portfolioUrl || student?.portfolioUrl || '');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'submit' | 'draft' | null>(null);
  const [discard, setDiscard] = useState(false);

  if (!student) return null;
  if (!listing) {
    return (
      <div className="container page">
        <EmptyState icon={<SearchX size={22} />} title={t.notFound.listingTitle} body={t.notFound.listingBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  // `busy` keeps the form mounted during submit so the page does not flash the "already applied" state.
  if (existing && existing.status !== 'draft' && busy !== 'submit') {
    return (
      <div className="container container-narrow page">
        <EmptyState icon={<FileCheck size={22} />} title={a.alreadyTitle} body={a.alreadyBody}>
          <ButtonLink to={`/applications/${existing.id}`} variant="primary">
            {t.pub.detail.viewApplication}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }
  if (!isOpen(listing)) {
    return (
      <div className="container container-narrow page">
        <EmptyState icon={<CircleAlert size={22} />} title={a.closedTitle} body={a.closedBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const startup = startupOf(db, listing);
  const status = listingStatus(db, listing);
  const match = matchFor(db, student, listing);
  const university = db.universities.find((u) => u.id === student.universityId);

  // What the company will see, and what is still missing.
  const checklist: { key: string; label: string; done: boolean; required: boolean }[] = [
    { key: 'university', label: a.check.university, done: !!student.universityId, required: true },
    { key: 'major', label: a.check.major, done: !!student.major && !!student.year, required: true },
    { key: 'resume', label: a.check.resume, done: !!student.resume, required: true },
    { key: 'motivation', label: a.check.motivation, done: motivation.trim().length >= MIN_MOTIVATION, required: true },
    { key: 'faculty', label: a.check.faculty, done: !!student.faculty.trim(), required: false },
    { key: 'skills', label: a.check.skills, done: student.skills.length >= 3, required: false },
    { key: 'experience', label: a.check.experience, done: !!student.experience, required: false },
  ];
  const requiredLeft = checklist.filter((c) => c.required && !c.done).length;

  const profileRows: [string, string][] = [
    [t.stu.profile.name, student.name],
    [t.stu.profile.email, student.email],
    [t.stu.profile.university, university?.name ?? ''],
    [t.stu.profile.faculty, student.faculty],
    [t.stu.profile.major, student.major ? t.majors[student.major] : ''],
    [t.stu.profile.year, student.year ? t.years(student.year) : ''],
    [t.stu.profile.sections.skills, student.skills.map((s) => t.skills[s as SkillId] ?? s).join(', ')],
    [t.stu.profile.sections.experience, student.experience ? t.experience[student.experience] : ''],
  ];

  const input = () => ({ motivation: motivation.trim(), availableFrom, portfolioUrl: portfolioUrl.trim(), resume: student.resume });

  const onSaveDraft = async () => {
    if (portfolioUrl && !isUrl(portfolioUrl)) {
      setErrors({ portfolioUrl: t.errors.url });
      return;
    }
    setBusy('draft');
    await demoLatency(300);
    saveDraft(student.id, listing.id, input());
    setBusy(null);
    toast(a.draftSaved, { action: { label: a.viewApplications, to: '/applications?tab=drafts' } });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (motivation.trim().length < MIN_MOTIVATION) next.motivation = t.errors.minChars(MIN_MOTIVATION);
    if (portfolioUrl && !isUrl(portfolioUrl)) next.portfolioUrl = t.errors.url;
    if (!consent) next.consent = a.consentError;
    if (requiredLeft > 0) next.checklist = a.checklistError;
    setErrors(next);
    if (Object.keys(next).length) {
      toast(t.errors.fixForm, { kind: 'error' });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], .apply-checklist.has-error')?.focus());
      return;
    }
    setBusy('submit');
    await demoLatency(600);
    const applicationId = applyToListing(student.id, listing.id, input());
    navigate(`/applications/${applicationId}?submitted=1`, { replace: true });
  };

  return (
    <div className="container page">
      <Link to={`/internships/${listing.id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {a.back}
      </Link>
      <PageHead title={draft ? a.titleDraft : a.title} lead={draft ? a.draftLead(formatDateTime(draft.updatedAt)) : a.lead} />

      <div className="apply-layout">
        <form onSubmit={submit} noValidate className="profile-form apply-form">
          <div className="card card-pad apply-summary">
            {startup && <CompanyLogo company={startup} />}
            <div className="grow">
              <p style={{ fontWeight: 600 }}>{listing.title}</p>
              <p className="small muted">
                {startup?.name} · {stipendText(t, listing)} · {t.listing.months(listing.durationMonths)}
              </p>
              <div className="row-wrap" style={{ marginTop: 8 }}>
                <TrustBadge status={status} kind="listing" />
                <DeadlineTag listing={listing} />
              </div>
            </div>
          </div>

          {status === 'unverified' && (
            <div className="notice notice-danger">
              <ShieldAlert size={18} aria-hidden="true" />
              <div>
                <strong>{t.pub.detail.unverifiedWarnTitle}</strong>
                <p>{t.pub.detail.unverifiedWarn}</p>
              </div>
            </div>
          )}
          {match && !match.eligible && (
            <div className="notice notice-warn">
              <CircleAlert size={18} aria-hidden="true" />
              <p>{a.eligibilityWarn}</p>
            </div>
          )}

          <section className="card card-pad form-section">
            <div className="spread">
              <h2 className="card-title">{a.step1}</h2>
              <Link to="/profile" className="link-arrow">
                {a.editProfile}
              </Link>
            </div>
            <dl className="facts">
              {profileRows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v || <span className="muted">{a.notAdded}</span>}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card card-pad form-section">
            <div>
              <h2 className="card-title">{a.step2}</h2>
              <p className="small muted">{a.resumeHelp}</p>
            </div>
            <ResumeManager student={student} />
          </section>

          <section className="card card-pad form-section">
            <h2 className="card-title">{a.step3}</h2>
            <Field
              label={a.motivation}
              help={`${a.motivationHelp} ${a.charCount(motivation.trim().length, MIN_MOTIVATION)}`}
              error={errors.motivation}
            >
              {(p) => (
                <textarea
                  {...p}
                  className="textarea"
                  style={{ minHeight: 150 }}
                  maxLength={1200}
                  value={motivation}
                  onChange={(e) => {
                    setMotivation(e.target.value);
                    if (errors.motivation) setErrors({ ...errors, motivation: '' });
                  }}
                />
              )}
            </Field>
            <Field label={a.availableFrom} help={t.listing.starts(formatDate(listing.startDate))}>
              {(p) => (
                <select {...p} className="select" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)}>
                  {a.availableOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={a.portfolio} optional error={errors.portfolioUrl}>
              {(p) => (
                <input {...p} className="input" type="url" inputMode="url" placeholder="https://" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
              )}
            </Field>
          </section>

          <section className="card card-pad form-section">
            <h2 className="card-title">{a.step4}</h2>
            <div className="notice notice-info">
              <Info size={18} aria-hidden="true" />
              <p>{a.demoNote}</p>
            </div>
            <div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={consent}
                  aria-invalid={errors.consent ? true : undefined}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) setErrors({ ...errors, consent: '' });
                  }}
                />
                <span>{a.consent}</span>
              </label>
              {errors.consent && (
                <p className="error-text" role="alert">
                  <CircleAlert size={14} aria-hidden="true" />
                  {errors.consent}
                </p>
              )}
            </div>
          </section>

          <div className="form-actions">
            {draft ? (
              <Button variant="ghost" onClick={() => setDiscard(true)}>
                {a.discard}
              </Button>
            ) : (
              <ButtonLink to={`/internships/${listing.id}`} variant="ghost">
                {t.actions.cancel}
              </ButtonLink>
            )}
            <div className="row" style={{ marginLeft: 'auto' }}>
              <Button onClick={onSaveDraft} loading={busy === 'draft'} disabled={busy !== null}>
                {a.saveDraft}
              </Button>
              <Button type="submit" variant="primary" size="lg" loading={busy === 'submit'} loadingText={t.actions.submitting} disabled={busy !== null}>
                {a.submit}
              </Button>
            </div>
          </div>
        </form>

        <aside className="apply-side">
          <div className={`card card-pad apply-checklist${errors.checklist ? ' has-error' : ''}`} tabIndex={-1}>
            <h2 className="card-title">{a.checklistTitle}</h2>
            <p className="small muted" style={{ marginBottom: 8 }}>
              {requiredLeft ? a.checklistLeft(requiredLeft) : a.checklistReady}
            </p>
            <ul className="checklist small">
              {checklist.map((c) => (
                <li key={c.key} className={c.done ? '' : 'is-off'}>
                  {c.done ? <Check size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
                  <span>
                    {c.label}
                    {!c.required && <span className="muted"> ({t.actions.optional})</span>}
                    <span className="sr-only">{c.done ? ` (${a.done})` : ` (${a.missing})`}</span>
                  </span>
                </li>
              ))}
            </ul>
            {errors.checklist && (
              <p className="error-text" role="alert" style={{ marginTop: 8 }}>
                <CircleAlert size={14} aria-hidden="true" />
                {errors.checklist}
              </p>
            )}
            {checklist.some((c) => !c.done && ['university', 'major', 'faculty', 'skills', 'experience'].includes(c.key)) && (
              <ButtonLink to="/profile" size="sm">
                {a.editProfile}
              </ButtonLink>
            )}
          </div>
        </aside>
      </div>

      {discard && draft && (
        <ConfirmDialog
          title={a.discardTitle}
          body={a.discardBody}
          confirmLabel={a.discard}
          danger
          onClose={() => setDiscard(false)}
          onConfirm={() => {
            deleteDraft(draft.id);
            setDiscard(false);
            toast(a.discarded);
            navigate(`/internships/${listing.id}`);
          }}
        />
      )}
    </div>
  );
}
