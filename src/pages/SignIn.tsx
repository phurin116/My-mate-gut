import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, Building2, GraduationCap, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { INDUSTRIES } from '../domain/catalog';
import type { IndustryId, Role, User } from '../domain/types';
import { Button, Field, PageHead, useToast } from '../components/ui';
import { demoLatency, registerStartup, registerStudent, signIn } from '../data/actions';
import { DEMO_USER_IDS } from '../data/seed';
import { homePathFor, useSession } from '../data/selectors';
import { getState } from '../data/store';
import { useT } from '../i18n';
import { isEmail, isUrl } from '../domain/validate';

const ROLE_ICONS: Record<Role, typeof UserRound> = {
  student: UserRound,
  startup: Building2,
  university: GraduationCap,
  admin: ShieldCheck,
};

type Errors = Record<string, string>;

function StudentForm({ onDone }: { onDone: (user: User, next?: string) => void }) {
  const t = useT();
  const s = t.pub.signIn;
  const { db } = useSession();
  const [form, setForm] = useState({ name: '', email: '', universityId: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = t.errors.required;
    if (!isEmail(form.email)) next.email = t.errors.email;
    if (!form.universityId) next.universityId = t.errors.required;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await demoLatency();
    const id = registerStudent({ name: form.name.trim(), email: form.email.trim(), universityId: form.universityId });
    onDone(getState().db.users.find((u) => u.id === id)!, '/profile?welcome=1');
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <Field label={s.name} error={errors.name}>
        {(p) => <input {...p} className="input" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      </Field>
      <Field label={s.email} help={s.emailHelpStudent} error={errors.email}>
        {(p) => (
          <input {...p} className="input" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        )}
      </Field>
      <Field label={s.university} error={errors.universityId}>
        {(p) => (
          <select {...p} className="select" value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })}>
            <option value="">{s.chooseUniversity}</option>
            {db.universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <p className="small muted">{s.studentNext}</p>
      <Button type="submit" variant="primary" size="lg" block loading={busy} loadingText={t.actions.submitting}>
        {s.createStudentCta}
      </Button>
    </form>
  );
}

function StartupForm({ onDone }: { onDone: (user: User, next?: string) => void }) {
  const t = useT();
  const s = t.pub.signIn;
  const [form, setForm] = useState({
    contactName: '',
    contactRole: '',
    email: '',
    companyName: '',
    industry: '' as IndustryId | '',
    district: '',
    teamSize: '',
    foundedYear: '',
    website: '',
    tagline: '',
    about: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    (['contactName', 'contactRole', 'companyName', 'district', 'tagline'] as const).forEach((k) => {
      if (!form[k].trim()) next[k] = t.errors.required;
    });
    if (!isEmail(form.email)) next.email = t.errors.email;
    if (!form.industry) next.industry = t.errors.required;
    const year = Number(form.foundedYear);
    if (!Number.isInteger(year) || year < 1990 || year > new Date().getFullYear()) next.foundedYear = t.errors.number;
    if (form.website && !isUrl(form.website)) next.website = t.errors.url;
    if (form.about.trim().length < 40) next.about = t.errors.minChars(40);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await demoLatency();
    const id = registerStartup({
      ...form,
      industry: form.industry as IndustryId,
      foundedYear: year,
      contactName: form.contactName.trim(),
      companyName: form.companyName.trim(),
      about: form.about.trim(),
    });
    onDone(getState().db.users.find((u) => u.id === id)!);
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="form-grid cols-2">
        <Field label={s.contactName} error={errors.contactName}>
          {(p) => <input {...p} className="input" autoComplete="name" value={form.contactName} onChange={set('contactName')} />}
        </Field>
        <Field label={s.contactRole} error={errors.contactRole}>
          {(p) => <input {...p} className="input" placeholder={s.contactRolePlaceholder} value={form.contactRole} onChange={set('contactRole')} />}
        </Field>
        <div className="span-2">
          <Field label={s.workEmail} error={errors.email}>
            {(p) => <input {...p} className="input" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} />}
          </Field>
        </div>
        <Field label={s.companyName} error={errors.companyName}>
          {(p) => <input {...p} className="input" autoComplete="organization" value={form.companyName} onChange={set('companyName')} />}
        </Field>
        <Field label={s.industry} error={errors.industry}>
          {(p) => (
            <select {...p} className="select" value={form.industry} onChange={set('industry')}>
              <option value="" />
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {t.industries[i]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={s.district} error={errors.district}>
          {(p) => <input {...p} className="input" placeholder={s.districtPlaceholder} value={form.district} onChange={set('district')} />}
        </Field>
        <Field label={s.founded} error={errors.foundedYear}>
          {(p) => <input {...p} className="input" inputMode="numeric" value={form.foundedYear} onChange={set('foundedYear')} />}
        </Field>
        <Field label={s.teamSize} optional>
          {(p) => <input {...p} className="input" placeholder={s.teamSizePlaceholder} value={form.teamSize} onChange={set('teamSize')} />}
        </Field>
        <Field label={s.website} optional error={errors.website}>
          {(p) => <input {...p} className="input" type="url" inputMode="url" placeholder="https://" value={form.website} onChange={set('website')} />}
        </Field>
        <div className="span-2">
          <Field label={s.tagline} error={errors.tagline}>
            {(p) => <input {...p} className="input" maxLength={90} placeholder={s.taglinePlaceholder} value={form.tagline} onChange={set('tagline')} />}
          </Field>
        </div>
        <div className="span-2">
          <Field label={s.about} help={s.aboutHelp} error={errors.about}>
            {(p) => <textarea {...p} className="textarea" maxLength={600} value={form.about} onChange={set('about')} />}
          </Field>
        </div>
      </div>
      <p className="small muted">{s.startupNext}</p>
      <Button type="submit" variant="primary" size="lg" block loading={busy} loadingText={t.actions.submitting}>
        {s.createStartupCta}
      </Button>
    </form>
  );
}

export default function SignIn() {
  const t = useT();
  const s = t.pub.signIn;
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { db, user: current } = useSession();
  // Someone who is already signed in when they arrive has no use for this page.
  const arrivedSignedIn = useRef(current).current;
  const tab = params.get('tab') === 'create' ? 'create' : 'demo';
  const as = params.get('as') === 'startup' ? 'startup' : 'student';
  const state = location.state as { from?: string; required?: boolean } | null;

  const finish = (user: User, next?: string) => {
    toast(s.welcome(user.name));
    // Return to where the visitor was heading only when that page suits their role.
    const from = state?.from;
    const target = next ?? (from && user.role === 'student' ? from : homePathFor(user));
    navigate(target, { replace: true });
  };

  const demoRoles: Role[] = ['student', 'startup', 'university', 'admin'];
  if (arrivedSignedIn) return <Navigate to={homePathFor(arrivedSignedIn)} replace />;

  return (
    <div className="container container-narrow page">
      <PageHead title={s.title} lead={s.lead} />
      {state?.required && (
        <div className="notice notice-info" style={{ marginBottom: 16 }}>
          {s.requiresSignIn}
        </div>
      )}

      <div className="tabs" role="tablist" style={{ marginBottom: 20 }}>
        {(['demo', 'create'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="tab"
            onClick={() => setParams(id === 'demo' ? {} : { tab: 'create', as }, { replace: true, state })}
          >
            {id === 'demo' ? s.tabDemo : s.tabCreate}
          </button>
        ))}
      </div>

      {tab === 'demo' ? (
        <ul className="demo-accounts">
          {demoRoles.map((role) => {
            const user = db.users.find((u) => u.id === DEMO_USER_IDS[role]);
            if (!user) return null;
            const Icon = ROLE_ICONS[role];
            return (
              <li key={role}>
                <button
                  type="button"
                  className="card demo-account"
                  onClick={() => {
                    signIn(user.id);
                    finish(user);
                  }}
                >
                  <span className="empty-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span className="grow">
                    <span className="demo-account-name">{s.demoAccounts[role].name}</span>
                    <span className="small muted">{s.demoAccounts[role].body}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" className="demo-account-arrow" />
                  <span className="sr-only">{s.continueAs}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card card-pad">
          <div className="chips" role="group" style={{ marginBottom: 20 }}>
            {(['student', 'startup'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className="chip"
                aria-pressed={as === id}
                onClick={() => setParams({ tab: 'create', as: id }, { replace: true, state })}
              >
                {id === 'student' ? s.createStudent : s.createStartup}
              </button>
            ))}
          </div>
          {as === 'student' ? <StudentForm onDone={finish} /> : <StartupForm onDone={finish} />}
        </div>
      )}

      <p className="notice" style={{ marginTop: 20, paddingInline: 0, color: 'var(--muted)' }}>
        <Lock size={16} aria-hidden="true" />
        {s.noPassword}
      </p>
    </div>
  );
}
