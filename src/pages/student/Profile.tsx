import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Sparkles } from 'lucide-react';
import { EXPERIENCE_LEVELS, FIELDS, INDUSTRIES, MAJORS, SKILLS, WORK_MODES, type SkillId } from '../../domain/catalog';
import { profileCompleteness } from '../../domain/matching';
import type { ExperienceLevel, FieldId, MajorId, Student } from '../../domain/types';
import { isEmail, isUrl } from '../../domain/validate';
import { Button, ChipGroup, Field, PageHead, useToast } from '../../components/ui';
import { ResumeManager } from '../../components/resume';
import { demoLatency, updateStudent } from '../../data/actions';
import { useSession } from '../../data/selectors';
import { useT } from '../../i18n';

type Errors = Record<string, string>;

export default function Profile() {
  const t = useT();
  const p = t.stu.profile;
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const welcome = params.get('welcome') === '1';
  const { db, student } = useSession();
  const [form, setForm] = useState<Student | null>(student);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify({ ...form, resume: null, updatedAt: '' }) !== JSON.stringify({ ...student, resume: null, updatedAt: '' }),
    [form, student],
  );
  if (!student || !form) return null;

  const completeness = profileCompleteness(form);
  const patch = (changes: Partial<Student>) => setForm({ ...form, ...changes });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = t.errors.required;
    if (!isEmail(form.email)) next.email = t.errors.email;
    if (form.portfolioUrl && !isUrl(form.portfolioUrl)) next.portfolioUrl = t.errors.url;
    setErrors(next);
    if (Object.keys(next).length) {
      toast(t.errors.fixForm, { kind: 'error' });
      return;
    }
    setBusy(true);
    await demoLatency();
    const { resume: _resume, ...rest } = form;
    void _resume;
    updateStudent(student.id, { ...rest, name: form.name.trim(), email: form.email.trim(), faculty: form.faculty.trim() });
    setBusy(false);
    if (welcome) {
      toast(p.saved);
      navigate('/dashboard');
    } else {
      toast(p.saved, { action: { label: p.seeMatches, to: '/dashboard' } });
    }
  };

  return (
    <div className="container container-narrow page">
      <PageHead title={p.title} lead={p.lead} />

      {welcome && (
        <div className="notice notice-success" style={{ marginBottom: 20 }}>
          <Sparkles size={18} aria-hidden="true" />
          <div>
            <strong>{p.welcomeTitle}</strong>
            <p>{p.welcomeBody}</p>
          </div>
        </div>
      )}

      <div className="card card-pad profile-progress">
        <div className="spread small">
          <span>{p.progress(completeness.done, completeness.total)}</span>
          <span className="muted">{Math.round((completeness.done / completeness.total) * 100)}%</span>
        </div>
        <div
          className="meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={completeness.total}
          aria-valuenow={completeness.done}
          aria-label={p.progress(completeness.done, completeness.total)}
        >
          <span style={{ width: `${(completeness.done / completeness.total) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={submit} noValidate className="profile-form">
        <section className="card card-pad form-section">
          <h2 className="card-title">{p.sections.basics}</h2>
          <div className="form-grid cols-2">
            <Field label={p.name} error={errors.name}>
              {(a) => <input {...a} className="input" autoComplete="name" value={form.name} onChange={(e) => patch({ name: e.target.value })} />}
            </Field>
            <Field label={p.email} error={errors.email}>
              {(a) => <input {...a} className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => patch({ email: e.target.value })} />}
            </Field>
            <div className="span-2">
              <Field label={p.university}>
                {(a) => (
                  <select {...a} className="select" value={form.universityId ?? ''} onChange={(e) => patch({ universityId: e.target.value || null })}>
                    <option value="">{p.chooseUniversity}</option>
                    {db.universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <div className="span-2">
              <Field label={p.faculty} optional>
                {(a) => <input {...a} className="input" placeholder={p.facultyPlaceholder} value={form.faculty} onChange={(e) => patch({ faculty: e.target.value })} />}
              </Field>
            </div>
            <Field label={p.major}>
              {(a) => (
                <select {...a} className="select" value={form.major ?? ''} onChange={(e) => patch({ major: (e.target.value || null) as MajorId | null })}>
                  <option value="">{p.chooseMajor}</option>
                  {MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {t.majors[m]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={p.year}>
              {(a) => (
                <select {...a} className="select" value={form.year ?? ''} onChange={(e) => patch({ year: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">{p.chooseYear}</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>
                      {t.years(y)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        </section>

        <section className="card card-pad form-section" id="resume">
          <div>
            <h2 className="card-title">{p.sections.resume}</h2>
          </div>
          <ResumeManager student={student} />
        </section>

        <section className="card card-pad form-section">
          <div className="spread">
            <h2 className="card-title">{p.sections.skills}</h2>
            <span className="small muted">{p.skillsCount(form.skills.length)}</span>
          </div>
          <ChipGroup
            label={p.skills}
            help={p.skillsHelp}
            options={SKILLS}
            value={form.skills as SkillId[]}
            onChange={(skills) => patch({ skills })}
            getLabel={(s) => t.skills[s]}
          />
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{p.sections.interests}</h2>
          <ChipGroup
            label={p.interests}
            help={p.interestsHelp}
            options={FIELDS}
            value={form.interests}
            onChange={(interests) => patch({ interests })}
            getLabel={(f) => t.fields[f]}
            max={3}
          />
          <Field label={p.careerGoal}>
            {(a) => (
              <select {...a} className="select" value={form.careerGoal ?? ''} onChange={(e) => patch({ careerGoal: (e.target.value || null) as FieldId | null })}>
                <option value="">{p.careerGoalNone}</option>
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {t.fields[f]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <ChipGroup
            label={p.industries}
            help={p.industriesHelp}
            options={INDUSTRIES}
            value={form.industries}
            onChange={(industries) => patch({ industries })}
            getLabel={(i) => t.industries[i]}
          />
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{p.sections.experience}</h2>
          <fieldset className="field">
            <legend className="label">{p.experience}</legend>
            <p className="help">{p.experienceHelp}</p>
            {EXPERIENCE_LEVELS.map((level) => (
              <label key={level} className="check">
                <input
                  type="radio"
                  name="experience"
                  checked={form.experience === level}
                  onChange={() => patch({ experience: level as ExperienceLevel })}
                />
                <span>{t.experience[level]}</span>
              </label>
            ))}
          </fieldset>
          <Field label={p.experienceNote} optional>
            {(a) => (
              <textarea
                {...a}
                className="textarea"
                style={{ minHeight: 84 }}
                maxLength={400}
                placeholder={p.experienceNotePlaceholder}
                value={form.experienceNote}
                onChange={(e) => patch({ experienceNote: e.target.value })}
              />
            )}
          </Field>
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{p.sections.prefs}</h2>
          <ChipGroup
            label={p.workModes}
            options={WORK_MODES}
            value={form.prefs.workModes}
            onChange={(workModes) => patch({ prefs: { ...form.prefs, workModes } })}
            getLabel={(m) => t.workModes[m]}
          />
          <Field label={p.maxDuration}>
            {(a) => (
              <select
                {...a}
                className="select"
                value={form.prefs.maxDurationMonths ?? ''}
                onChange={(e) =>
                  patch({ prefs: { ...form.prefs, maxDurationMonths: e.target.value ? Number(e.target.value) : null } })
                }
              >
                <option value="">{p.maxDurationAny}</option>
                {[2, 3, 4, 6].map((m) => (
                  <option key={m} value={m}>
                    {t.listing.months(m)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <label className="check">
            <input
              type="checkbox"
              checked={form.prefs.paidOnly}
              onChange={(e) => patch({ prefs: { ...form.prefs, paidOnly: e.target.checked } })}
            />
            <span>{p.paidOnly}</span>
          </label>
        </section>

        <section className="card card-pad form-section">
          <h2 className="card-title">{p.sections.more}</h2>
          <Field label={p.about} help={p.aboutHelp} optional>
            {(a) => <textarea {...a} className="textarea" maxLength={500} value={form.about} onChange={(e) => patch({ about: e.target.value })} />}
          </Field>
          <Field label={p.portfolio} optional error={errors.portfolioUrl}>
            {(a) => (
              <input {...a} className="input" type="url" inputMode="url" placeholder="https://" value={form.portfolioUrl} onChange={(e) => patch({ portfolioUrl: e.target.value })} />
            )}
          </Field>
        </section>

        <div className="form-actions">
          <span className="small muted" aria-live="polite">
            {dirty ? p.unsaved : ''}
          </span>
          <Button type="submit" variant="primary" size="lg" loading={busy} loadingText={t.actions.saving} disabled={!dirty && !welcome}>
            {welcome ? p.saveAndContinue : p.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
