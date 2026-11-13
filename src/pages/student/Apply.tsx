import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, CircleAlert, FileCheck, SearchX, ShieldAlert } from 'lucide-react';
import type { SkillId } from '../../domain/catalog';
import { formatDate } from '../../domain/dates';
import { isUrl } from '../../domain/validate';
import { DeadlineTag, stipendText } from '../../components/listing';
import { TrustBadge } from '../../components/trust';
import { Button, ButtonLink, EmptyState, Field, Monogram, PageHead, useToast } from '../../components/ui';
import { applyToListing, demoLatency } from '../../data/actions';
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
  const [motivation, setMotivation] = useState('');
  const [availableFrom, setAvailableFrom] = useState(a.availableOptions[0]);
  const [portfolioUrl, setPortfolioUrl] = useState(student?.portfolioUrl ?? '');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

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

  const existing = applicationFor(db, student.id, listing.id);
  // `busy` keeps the form mounted during submit so the page does not flash the "already applied" state.
  if (existing && !busy) {
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
  const profileRows: [string, string][] = [
    [t.stu.profile.name, student.name],
    [t.stu.profile.email, student.email],
    [t.stu.profile.university, university?.name ?? ''],
    [t.stu.profile.major, student.major ? t.majors[student.major] : ''],
    [t.stu.profile.year, student.year ? t.years(student.year) : ''],
    [t.stu.profile.sections.skills, student.skills.map((s) => t.skills[s as SkillId] ?? s).join(', ')],
    [t.stu.profile.sections.experience, student.experience ? t.experience[student.experience] : ''],
  ];
  const incomplete = profileRows.some(([, v]) => !v);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (motivation.trim().length < MIN_MOTIVATION) next.motivation = t.errors.minChars(MIN_MOTIVATION);
    if (portfolioUrl && !isUrl(portfolioUrl)) next.portfolioUrl = t.errors.url;
    if (!consent) next.consent = a.consentError;
    setErrors(next);
    if (Object.keys(next).length) {
      toast(t.errors.fixForm, { kind: 'error' });
      return;
    }
    setBusy(true);
    await demoLatency(600);
    const applicationId = applyToListing(student.id, listing.id, {
      motivation: motivation.trim(),
      availableFrom,
      portfolioUrl: portfolioUrl.trim(),
    });
    navigate(`/applications/${applicationId}?submitted=1`, { replace: true });
  };

  return (
    <div className="container container-narrow page">
      <Link to={`/internships/${listing.id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {a.back}
      </Link>
      <PageHead title={a.title} />

      <div className="card card-pad apply-summary">
        <Monogram name={startup?.name ?? '?'} hue={startup?.hue ?? 0} />
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
        <div className="notice notice-danger" style={{ marginTop: 16 }}>
          <ShieldAlert size={18} aria-hidden="true" />
          <div>
            <strong>{t.pub.detail.unverifiedWarnTitle}</strong>
            <p>{t.pub.detail.unverifiedWarn}</p>
          </div>
        </div>
      )}
      {match && !match.eligible && (
        <div className="notice notice-warn" style={{ marginTop: 16 }}>
          <CircleAlert size={18} aria-hidden="true" />
          <p>{a.eligibilityWarn}</p>
        </div>
      )}

      <form onSubmit={submit} noValidate className="profile-form">
        <section className="card card-pad form-section">
          <div className="spread">
            <h2 className="card-title">{a.profileTitle}</h2>
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
          {incomplete && (
            <p className="notice notice-warn">
              <CircleAlert size={16} aria-hidden="true" />
              {a.profileIncomplete}
            </p>
          )}
        </section>

        <section className="card card-pad form-section">
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
          <Field label={a.portfolio} help={a.portfolioHelp} optional error={errors.portfolioUrl}>
            {(p) => (
              <input {...p} className="input" type="url" inputMode="url" placeholder="https://" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
            )}
          </Field>
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
          <ButtonLink to={`/internships/${listing.id}`} variant="ghost">
            {t.actions.cancel}
          </ButtonLink>
          <Button type="submit" variant="primary" size="lg" loading={busy} loadingText={t.actions.submitting}>
            {a.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
