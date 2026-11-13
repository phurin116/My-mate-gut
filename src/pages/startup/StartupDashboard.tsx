import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { BriefcaseBusiness, ExternalLink, Pencil, Plus, ShieldQuestion, Users } from 'lucide-react';
import { INDUSTRIES } from '../../domain/catalog';
import type { IndustryId, Listing, Startup } from '../../domain/types';
import { isUrl } from '../../domain/validate';
import { DeadlineTag } from '../../components/listing';
import { TrustBadge, VerificationPanel } from '../../components/trust';
import { Button, ButtonLink, ConfirmDialog, DemoTag, EmptyState, Field, PageHead, useToast } from '../../components/ui';
import { demoLatency, setListingOpen, updateStartup } from '../../data/actions';
import { listingStatus, startupStatus, useSession, verificationFor } from '../../data/selectors';
import { useT } from '../../i18n';

export function StartupDashboard() {
  const t = useT();
  const s = t.biz.startup;
  const toast = useToast();
  const { db, startup } = useSession();
  const [closing, setClosing] = useState<Listing | null>(null);
  if (!startup) return null;

  const status = startupStatus(db, startup.id);
  const listings = db.listings
    .filter((l) => l.startupId === startup.id)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const applications = db.applications.filter((a) => a.startupId === startup.id);
  const stats = [
    { label: s.stats.open, value: listings.filter((l) => l.status === 'open').length },
    { label: s.stats.applicants, value: applications.length },
    { label: s.stats.waiting, value: applications.filter((a) => a.status === 'submitted').length },
    { label: s.stats.interviews, value: applications.filter((a) => a.status === 'interview').length },
  ];

  return (
    <div className="container page">
      <PageHead
        title={s.title}
        lead={s.lead(startup.name)}
        actions={
          <ButtonLink to="/startup/listings/new" variant="primary" icon={<Plus size={16} aria-hidden="true" />}>
            {s.post}
          </ButtonLink>
        }
      />

      <div className="row-wrap" style={{ marginBottom: 16 }}>
        <TrustBadge status={status} kind="company" />
        {startup.isDemo && <DemoTag />}
      </div>

      {status !== 'verified' && (
        <div className="notice notice-warn" style={{ marginBottom: 20 }}>
          <ShieldQuestion size={18} aria-hidden="true" />
          <p>{s.statusNotice[status]}</p>
        </div>
      )}

      <ul className="stat-grid">
        {stats.map((x) => (
          <li key={x.label} className="card stat">
            <span className="stat-value display">{x.value}</span>
            <span className="stat-label">{x.label}</span>
          </li>
        ))}
      </ul>

      {listings.length === 0 ? (
        <EmptyState icon={<BriefcaseBusiness size={22} />} title={s.emptyTitle} body={s.emptyBody}>
          <ButtonLink to="/startup/listings/new" variant="primary">
            {s.post}
          </ButtonLink>
        </EmptyState>
      ) : (
        <ul className="manage-list">
          {listings.map((l) => {
            const apps = applications.filter((a) => a.listingId === l.id);
            const fresh = apps.filter((a) => a.status === 'submitted').length;
            return (
              <li key={l.id} className="card manage-item">
                <div className="grow">
                  <h2 className="manage-title">
                    <Link to={`/startup/listings/${l.id}/applicants`}>{l.title}</Link>
                  </h2>
                  <div className="row-wrap" style={{ marginTop: 6 }}>
                    <TrustBadge status={listingStatus(db, l)} kind="listing" />
                    {l.status === 'closed' ? <span className="tag">{s.closedTag}</span> : <DeadlineTag listing={l} />}
                    <span className="tag">{t.fields[l.field]}</span>
                  </div>
                </div>
                <Link to={`/startup/listings/${l.id}/applicants`} className="manage-count">
                  <Users size={16} aria-hidden="true" />
                  <strong>{apps.length}</strong>
                  <span className="muted">{s.viewApplicants.toLowerCase()}</span>
                  {fresh > 0 && <span className="tag tag-blue">{s.newCount(fresh)}</span>}
                </Link>
                <div className="row-wrap manage-actions">
                  <ButtonLink to={`/startup/listings/${l.id}/edit`} size="sm" icon={<Pencil size={14} aria-hidden="true" />}>
                    {t.actions.edit}
                  </ButtonLink>
                  {l.status === 'open' ? (
                    <Button size="sm" onClick={() => setClosing(l)}>
                      {s.closeListing}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setListingOpen(l.id, true);
                        toast(s.reopened);
                      }}
                    >
                      {s.reopenListing}
                    </Button>
                  )}
                  <Link to={`/internships/${l.id}`} className="icon-btn" aria-label={`${s.viewPublic}: ${l.title}`} title={s.viewPublic}>
                    <ExternalLink size={16} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {closing && (
        <ConfirmDialog
          title={s.closeTitle}
          body={s.closeBody}
          confirmLabel={s.closeListing}
          danger
          onClose={() => setClosing(null)}
          onConfirm={() => {
            setListingOpen(closing.id, false);
            setClosing(null);
            toast(s.closed);
          }}
        />
      )}
    </div>
  );
}

export function CompanyProfileForm() {
  const t = useT();
  const c = t.biz.companyForm;
  const si = t.pub.signIn;
  const toast = useToast();
  const { db, startup } = useSession();
  const [form, setForm] = useState<Startup | null>(startup);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  if (!startup || !form) return null;
  const set = (key: keyof Startup) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.tagline.trim()) next.tagline = t.errors.required;
    if (!form.district.trim()) next.district = t.errors.required;
    if (form.about.trim().length < 40) next.about = t.errors.minChars(40);
    if (form.website && !isUrl(form.website)) next.website = t.errors.url;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await demoLatency();
    updateStartup(startup.id, {
      tagline: form.tagline.trim(),
      about: form.about.trim(),
      industry: form.industry,
      district: form.district.trim(),
      teamSize: form.teamSize,
      stage: form.stage,
      website: form.website.trim(),
      contactName: form.contactName,
      contactRole: form.contactRole,
    });
    setBusy(false);
    toast(c.saved, { action: { label: c.viewPublic, to: `/companies/${startup.id}` } });
  };

  return (
    <div className="container page">
      <PageHead
        title={c.title}
        lead={c.lead}
        actions={<ButtonLink to={`/companies/${startup.id}`} size="sm">{c.viewPublic}</ButtonLink>}
      />
      <div className="detail-layout">
        <form className="detail-main card card-pad form-section" onSubmit={submit} noValidate>
          <div className="form-grid cols-2">
            <div className="span-2">
              <Field label={si.companyName} help={c.nameLocked}>
                {(p) => <input {...p} className="input" value={form.name} disabled readOnly />}
              </Field>
            </div>
            <div className="span-2">
              <Field label={si.tagline} error={errors.tagline}>
                {(p) => <input {...p} className="input" maxLength={90} value={form.tagline} onChange={set('tagline')} />}
              </Field>
            </div>
            <div className="span-2">
              <Field label={si.about} help={si.aboutHelp} error={errors.about}>
                {(p) => <textarea {...p} className="textarea" maxLength={600} value={form.about} onChange={set('about')} />}
              </Field>
            </div>
            <Field label={si.industry}>
              {(p) => (
                <select {...p} className="select" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value as IndustryId })}>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {t.industries[i]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={si.district} error={errors.district}>
              {(p) => <input {...p} className="input" value={form.district} onChange={set('district')} />}
            </Field>
            <Field label={c.stage} optional>
              {(p) => <input {...p} className="input" placeholder={c.stagePlaceholder} value={form.stage} onChange={set('stage')} />}
            </Field>
            <Field label={si.teamSize} optional>
              {(p) => <input {...p} className="input" placeholder={si.teamSizePlaceholder} value={form.teamSize} onChange={set('teamSize')} />}
            </Field>
            <Field label={si.contactName}>
              {(p) => <input {...p} className="input" value={form.contactName} onChange={set('contactName')} />}
            </Field>
            <Field label={si.contactRole}>
              {(p) => <input {...p} className="input" value={form.contactRole} onChange={set('contactRole')} />}
            </Field>
            <div className="span-2">
              <Field label={si.website} optional error={errors.website}>
                {(p) => <input {...p} className="input" type="url" placeholder="https://" value={form.website} onChange={set('website')} />}
              </Field>
            </div>
          </div>
          <div>
            <Button type="submit" variant="primary" loading={busy} loadingText={t.actions.saving}>
              {t.actions.saveChanges}
            </Button>
          </div>
        </form>
        <aside className="detail-side">
          <div className="card card-pad">
            <h2 className="eyebrow" style={{ marginBottom: 10 }}>
              {c.verification}
            </h2>
            <VerificationPanel record={verificationFor(db, 'startup', startup.id)} subject="startup" isDemo={startup.isDemo} />
          </div>
        </aside>
      </div>
    </div>
  );
}
