import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Info, Lock } from 'lucide-react';
import { FIELDS, SKILLS, WORK_MODES, type SkillId } from '../../domain/catalog';
import { daysFromNow, daysUntil, toDateInput } from '../../domain/dates';
import type { FieldId, WorkMode } from '../../domain/types';
import { Button, ButtonLink, ChipGroup, EmptyState, Field, PageHead, useToast } from '../../components/ui';
import { demoLatency, saveListing } from '../../data/actions';
import { useSession } from '../../data/selectors';
import { useT } from '../../i18n';

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

export default function ListingForm() {
  const t = useT();
  const f = t.biz.listingForm;
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { db, startup } = useSession();
  const existing = id ? db.listings.find((l) => l.id === id) : undefined;

  const [form, setForm] = useState(() => ({
    title: existing?.title ?? '',
    field: (existing?.field ?? '') as FieldId | '',
    summary: existing?.summary ?? '',
    responsibilities: existing?.responsibilities.join('\n') ?? '',
    learning: existing?.learning.join('\n') ?? '',
    requirements: existing?.requirements.join('\n') ?? '',
    skills: (existing?.skills ?? []) as SkillId[],
    noExperienceRequired: existing?.noExperienceRequired ?? true,
    minYear: existing?.minYear ?? 1,
    workMode: (existing?.workMode ?? 'hybrid') as WorkMode,
    district: existing?.district ?? startup?.district ?? '',
    paid: existing?.paid ?? true,
    stipend: existing?.stipendMonthly ? String(existing.stipendMonthly) : '',
    durationMonths: existing?.durationMonths ?? 3,
    hoursPerWeek: String(existing?.hoursPerWeek ?? 24),
    deadline: toDateInput(existing?.deadline ?? daysFromNow(21)),
    startDate: toDateInput(existing?.startDate ?? daysFromNow(42)),
    openings: existing?.openings ?? 1,
    supervisorName: existing?.supervisorName ?? '',
    supervisorRole: existing?.supervisorRole ?? '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!startup) return null;
  if (id && (!existing || existing.startupId !== startup.id)) {
    return (
      <div className="container page">
        <EmptyState icon={<Lock size={22} />} title={t.notFound.listingTitle} body={t.biz.startup.noAccess}>
          <ButtonLink to="/startup" variant="primary">
            {f.back}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm({ ...form, [key]: value });
  const text = (key: 'title' | 'summary' | 'responsibilities' | 'learning' | 'requirements' | 'district' | 'stipend' | 'hoursPerWeek' | 'deadline' | 'startDate' | 'supervisorName' | 'supervisorRole') =>
    (e: { target: { value: string } }) => set(key, e.target.value);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const responsibilities = lines(form.responsibilities);
    const requirements = lines(form.requirements);
    const hours = Number(form.hoursPerWeek);
    const stipend = Number(form.stipend);
    const deadline = new Date(`${form.deadline}T23:00:00`);
    const startDate = new Date(`${form.startDate}T09:00:00`);
    if (form.title.trim().length < 4) next.title = t.errors.required;
    if (!form.field) next.field = t.errors.required;
    if (form.summary.trim().length < 40) next.summary = t.errors.minChars(40);
    if (responsibilities.length < 3) next.responsibilities = f.responsibilitiesError;
    if (requirements.length < 1) next.requirements = f.requirementsError;
    if (form.skills.length === 0) next.skills = f.skillsError;
    if (form.workMode !== 'remote' && !form.district.trim()) next.district = t.errors.required;
    if (form.paid && (!Number.isFinite(stipend) || stipend < 1000)) next.stipend = f.stipendError;
    if (!Number.isFinite(hours) || hours < 5 || hours > 48) next.hoursPerWeek = f.hoursError;
    if (Number.isNaN(deadline.getTime()) || daysUntil(deadline.toISOString()) < 0) next.deadline = f.deadlineError;
    if (Number.isNaN(startDate.getTime()) || startDate <= deadline) next.startDate = f.startError;
    if (!form.supervisorName.trim()) next.supervisorName = t.errors.required;
    if (!form.supervisorRole.trim()) next.supervisorRole = t.errors.required;
    setErrors(next);
    if (Object.keys(next).length) {
      toast(t.errors.fixForm, { kind: 'error' });
      // Move focus to the first invalid control so keyboard users land on the problem.
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    await demoLatency(600);
    saveListing(
      startup.id,
      {
        title: form.title.trim(),
        field: form.field as FieldId,
        summary: form.summary.trim(),
        responsibilities,
        learning: lines(form.learning),
        requirements,
        skills: form.skills,
        noExperienceRequired: form.noExperienceRequired,
        minYear: form.minYear,
        workMode: form.workMode,
        district: form.district.trim() || startup.district,
        paid: form.paid,
        stipendMonthly: form.paid ? stipend : null,
        durationMonths: form.durationMonths,
        hoursPerWeek: hours,
        startDate: startDate.toISOString(),
        deadline: deadline.toISOString(),
        openings: form.openings,
        supervisorName: form.supervisorName.trim(),
        supervisorRole: form.supervisorRole.trim(),
      },
      existing?.id,
    );
    toast(existing ? f.updated : f.created);
    navigate('/startup');
  };

  return (
    <div className="container container-narrow page">
      <Link to="/startup" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {f.back}
      </Link>
      <PageHead title={existing ? f.editTitle : f.newTitle} lead={f.lead} />
      <div className="notice notice-info">
        <Info size={18} aria-hidden="true" />
        <p>{f.reviewNote}</p>
      </div>

      <form onSubmit={submit} noValidate className="profile-form">
        <section className="card card-pad form-section">
          <h2 className="card-title">{f.sections.role}</h2>
          <div className="form-grid cols-2">
            <Field label={f.title} error={errors.title}>
              {(p) => <input {...p} className="input" maxLength={70} placeholder={f.titlePlaceholder} value={form.title} onChange={text('title')} />}
            </Field>
            <Field label={f.field} error={errors.field}>
              {(p) => (
                <select {...p} className="select" value={form.field} onChange={(e) => set('field', e.target.value as FieldId)}>
                  <option value="">{f.chooseField}</option>
                  {FIELDS.map((x) => (
                    <option key={x} value={x}>
                      {t.fields[x]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div className="span-2">
              <Field label={f.summary} help={f.summaryHelp} error={errors.summary}>
                {(p) => <textarea {...p} className="textarea" style={{ minHeight: 84 }} maxLength={300} value={form.summary} onChange={text('summary')} />}
              </Field>
            </div>
          </div>
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{f.sections.work}</h2>
          <Field label={f.responsibilities} help={f.responsibilitiesHelp} error={errors.responsibilities}>
            {(p) => <textarea {...p} className="textarea" value={form.responsibilities} onChange={text('responsibilities')} />}
          </Field>
          <Field label={f.learning} help={f.learningHelp} optional>
            {(p) => <textarea {...p} className="textarea" style={{ minHeight: 84 }} value={form.learning} onChange={text('learning')} />}
          </Field>
          <ChipGroup
            label={f.skills}
            help={f.skillsHelp}
            error={errors.skills}
            options={SKILLS}
            value={form.skills}
            onChange={(skills) => set('skills', skills)}
            getLabel={(s) => t.skills[s]}
            max={6}
          />
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{f.sections.who}</h2>
          <div>
            <label className="check">
              <input type="checkbox" checked={form.noExperienceRequired} onChange={(e) => set('noExperienceRequired', e.target.checked)} />
              <span>
                {f.noExperience}
                <span className="help" style={{ display: 'block' }}>
                  {f.noExperienceHelp}
                </span>
              </span>
            </label>
          </div>
          <Field label={f.minYear}>
            {(p) => (
              <select {...p} className="select" value={form.minYear} onChange={(e) => set('minYear', Number(e.target.value))}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    {t.listing.minYear(y)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={f.requirements} help={f.requirementsHelp} error={errors.requirements}>
            {(p) => <textarea {...p} className="textarea" style={{ minHeight: 84 }} value={form.requirements} onChange={text('requirements')} />}
          </Field>
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{f.sections.terms}</h2>
          <div className="form-grid cols-2">
            <Field label={f.workMode}>
              {(p) => (
                <select {...p} className="select" value={form.workMode} onChange={(e) => set('workMode', e.target.value as WorkMode)}>
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>
                      {t.workModes[m]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={f.district} error={errors.district} optional={form.workMode === 'remote'}>
              {(p) => <input {...p} className="input" value={form.district} onChange={text('district')} />}
            </Field>
            <div className="span-2">
              <label className="check">
                <input type="checkbox" checked={form.paid} onChange={(e) => set('paid', e.target.checked)} />
                <span>{f.paid}</span>
              </label>
            </div>
            {form.paid && (
              <Field label={f.stipend} error={errors.stipend}>
                {(p) => <input {...p} className="input" inputMode="numeric" value={form.stipend} onChange={text('stipend')} />}
              </Field>
            )}
            <Field label={f.hours} error={errors.hoursPerWeek}>
              {(p) => <input {...p} className="input" inputMode="numeric" value={form.hoursPerWeek} onChange={text('hoursPerWeek')} />}
            </Field>
            <Field label={f.duration}>
              {(p) => (
                <select {...p} className="select" value={form.durationMonths} onChange={(e) => set('durationMonths', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <option key={m} value={m}>
                      {t.listing.months(m)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={f.openings}>
              {(p) => (
                <select {...p} className="select" value={form.openings} onChange={(e) => set('openings', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={f.deadline} error={errors.deadline}>
              {(p) => <input {...p} className="input" type="date" value={form.deadline} onChange={text('deadline')} />}
            </Field>
            <Field label={f.startDate} error={errors.startDate}>
              {(p) => <input {...p} className="input" type="date" value={form.startDate} onChange={text('startDate')} />}
            </Field>
          </div>
        </section>

        <section className="card card-pad form-section">
          <div>
            <h2 className="card-title">{f.sections.supervisor}</h2>
            <p className="small muted">{f.supervisorHelp}</p>
          </div>
          <div className="form-grid cols-2">
            <Field label={f.supervisorName} error={errors.supervisorName}>
              {(p) => <input {...p} className="input" value={form.supervisorName} onChange={text('supervisorName')} />}
            </Field>
            <Field label={f.supervisorRole} error={errors.supervisorRole}>
              {(p) => <input {...p} className="input" value={form.supervisorRole} onChange={text('supervisorRole')} />}
            </Field>
          </div>
        </section>

        <div className="form-actions">
          <ButtonLink to="/startup" variant="ghost">
            {t.actions.cancel}
          </ButtonLink>
          <Button type="submit" variant="primary" size="lg" loading={busy} loadingText={t.actions.saving}>
            {f.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
