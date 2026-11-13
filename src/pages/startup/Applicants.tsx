import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ChevronDown, Lock, Users } from 'lucide-react';
import type { SkillId } from '../../domain/catalog';
import { daysFromNow, formatDate, toLocalInput } from '../../domain/dates';
import { matchListing } from '../../domain/matching';
import type { Application, InterviewInfo } from '../../domain/types';
import { Timeline } from '../../components/application';
import { MatchRing } from '../../components/match';
import { StatusPill } from '../../components/trust';
import { Button, ButtonLink, Dialog, EmptyState, Field, PageHead, Tooltip, useToast } from '../../components/ui';
import { demoLatency, startupSetStatus } from '../../data/actions';
import { useSession } from '../../data/selectors';
import { useT } from '../../i18n';

type Action = 'review' | 'interview' | 'offer' | 'reject' | 'complete';
const ACTION_STATUS = {
  review: 'in_review',
  interview: 'interview',
  offer: 'offer',
  reject: 'rejected',
  complete: 'completed',
} as const;

function actionsFor(status: Application['status']): Action[] {
  switch (status) {
    case 'submitted':
      return ['review', 'interview', 'reject'];
    case 'in_review':
      return ['interview', 'offer', 'reject'];
    case 'interview':
      return ['offer', 'reject'];
    case 'accepted':
      return ['complete'];
    default:
      return [];
  }
}

function ActionDialog({
  action,
  application,
  defaultInterviewer,
  onClose,
}: {
  action: Action;
  application: Application;
  defaultInterviewer: string;
  onClose: () => void;
}) {
  const t = useT();
  const a = t.biz.applicants;
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [when, setWhen] = useState(toLocalInput(daysFromNow(5, 14)));
  const [mode, setMode] = useState<InterviewInfo['mode']>('video');
  const [place, setPlace] = useState('');
  const [withName, setWithName] = useState(defaultInterviewer);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next: Record<string, string> = {};
    if ((action === 'reject' || action === 'offer') && message.trim().length < 10) next.message = a.messageRequired;
    if (action === 'interview') {
      if (!when || new Date(when).getTime() < Date.now()) next.when = a.whenError;
      if (!place.trim()) next.place = a.placeError;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await demoLatency();
    startupSetStatus(
      application.id,
      ACTION_STATUS[action],
      message.trim(),
      action === 'interview'
        ? { at: new Date(when).toISOString(), mode, place: place.trim(), withName: withName.trim(), note: note.trim() }
        : undefined,
    );
    toast(a.done);
    onClose();
  };

  return (
    <Dialog
      title={a.dialog[action]}
      onClose={onClose}
      wide={action === 'interview'}
      footer={
        <>
          <Button onClick={onClose}>{t.actions.cancel}</Button>
          <Button variant={action === 'reject' ? 'danger' : 'primary'} onClick={submit} loading={busy}>
            {a.send}
          </Button>
        </>
      }
    >
      <div className="stack">
        <p className="muted small">{a.dialogHelp[action]}</p>
        {action === 'interview' && (
          <div className="form-grid cols-2">
            <Field label={a.when} error={errors.when}>
              {(p) => <input {...p} className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} data-autofocus />}
            </Field>
            <Field label={a.mode}>
              {(p) => (
                <select {...p} className="select" value={mode} onChange={(e) => setMode(e.target.value as InterviewInfo['mode'])}>
                  <option value="video">{t.stu.application.interviewModes.video}</option>
                  <option value="in_person">{t.stu.application.interviewModes.in_person}</option>
                </select>
              )}
            </Field>
            <div className="span-2">
              <Field label={a.place} error={errors.place}>
                {(p) => <input {...p} className="input" value={place} onChange={(e) => setPlace(e.target.value)} />}
              </Field>
            </div>
            <Field label={a.withName}>
              {(p) => <input {...p} className="input" value={withName} onChange={(e) => setWithName(e.target.value)} />}
            </Field>
            <Field label={a.note} optional>
              {(p) => <input {...p} className="input" value={note} onChange={(e) => setNote(e.target.value)} />}
            </Field>
          </div>
        )}
        <Field
          label={a.message}
          help={a.messageHelp}
          error={errors.message}
          optional={action !== 'reject' && action !== 'offer'}
        >
          {(p) => (
            <textarea
              {...p}
              className="textarea"
              style={{ minHeight: 96 }}
              maxLength={600}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-autofocus={action !== 'interview' ? true : undefined}
            />
          )}
        </Field>
      </div>
    </Dialog>
  );
}

export default function Applicants() {
  const t = useT();
  const a = t.biz.applicants;
  const { id } = useParams();
  const { db, startup } = useSession();
  const [tab, setTab] = useState<'all' | 'new' | 'progress' | 'closed'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ action: Action; application: Application } | null>(null);
  const listing = db.listings.find((l) => l.id === id);

  if (!startup) return null;
  if (!listing || listing.startupId !== startup.id) {
    return (
      <div className="container page">
        <EmptyState icon={<Lock size={22} />} title={t.notFound.listingTitle} body={t.biz.startup.noAccess}>
          <ButtonLink to="/startup" variant="primary">
            {a.back}
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const all = db.applications
    .filter((x) => x.listingId === listing.id)
    .sort((x, y) => y.appliedAt.localeCompare(x.appliedAt));
  const groups = {
    all,
    new: all.filter((x) => x.status === 'submitted'),
    progress: all.filter((x) => ['in_review', 'interview', 'offer', 'accepted'].includes(x.status)),
    closed: all.filter((x) => ['rejected', 'withdrawn', 'declined', 'completed'].includes(x.status)),
  };
  const shown = groups[tab];

  return (
    <div className="container page">
      <Link to="/startup" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {a.back}
      </Link>
      <PageHead
        eyebrow={a.title}
        title={listing.title}
        lead={a.count(all.length)}
        actions={<ButtonLink to={`/internships/${listing.id}`} size="sm">{t.biz.startup.viewPublic}</ButtonLink>}
      />

      {all.length === 0 ? (
        <EmptyState icon={<Users size={22} />} title={a.emptyTitle} body={a.emptyBody} />
      ) : (
        <>
          <div className="tabs" role="tablist" style={{ marginBottom: 16 }}>
            {(['all', 'new', 'progress', 'closed'] as const).map((key) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} className="tab" onClick={() => setTab(key)}>
                {a.tabs[key]} <span className="count">{groups[key].length}</span>
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="muted" style={{ padding: '24px 0' }}>
              {a.emptyFilter}
            </p>
          ) : (
            <ul className="applicant-list">
              {shown.map((app) => {
                const student = db.students.find((s) => s.id === app.studentId);
                if (!student) return null;
                const university = db.universities.find((u) => u.id === student.universityId);
                const match = matchListing(student, listing, startup);
                const expanded = open === app.id;
                const actions = actionsFor(app.status);
                return (
                  <li key={app.id} className="card applicant">
                    <div className="applicant-head">
                      <span className="avatar lg" aria-hidden="true">
                        {student.name[0]}
                      </span>
                      <div className="grow">
                        <h2 className="manage-title">{student.name}</h2>
                        <p className="small muted">
                          {[
                            student.major ? t.majors[student.major] : '',
                            student.year ? t.years(student.year) : '',
                            university?.shortName ?? '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <p className="small muted">{a.appliedOn(formatDate(app.appliedAt))}</p>
                      </div>
                      {match.score != null && (
                        <Tooltip text={a.fitHelp} align="end">
                          <span className="row" style={{ gap: 8 }}>
                            <span className="small muted">{a.fit}</span>
                            <MatchRing score={match.score} size={40} />
                          </span>
                        </Tooltip>
                      )}
                    </div>

                    <div className="row-wrap">
                      <StatusPill status={app.status} />
                      {student.skills
                        .filter((s) => listing.skills.includes(s))
                        .map((s) => (
                          <span key={s} className="tag tag-green">
                            {t.skills[s as SkillId] ?? s}
                          </span>
                        ))}
                    </div>

                    <div>
                      <p className="eyebrow">{a.motivation}</p>
                      <p>{app.motivation}</p>
                    </div>

                    {expanded && (
                      <div className="applicant-more">
                        <dl className="facts stacked">
                          <div>
                            <dt>{a.skills}</dt>
                            <dd>{student.skills.map((s) => t.skills[s as SkillId] ?? s).join(', ') || '–'}</dd>
                          </div>
                          <div>
                            <dt>{a.experience}</dt>
                            <dd>
                              {student.experience ? t.experience[student.experience] : '–'}
                              {student.experienceNote ? `. ${student.experienceNote}` : ''}
                            </dd>
                          </div>
                          {student.about && (
                            <div>
                              <dt>{a.about}</dt>
                              <dd>{student.about}</dd>
                            </div>
                          )}
                          <div>
                            <dt>{a.availability}</dt>
                            <dd>{app.availableFrom}</dd>
                          </div>
                          {(app.portfolioUrl || student.portfolioUrl) && (
                            <div>
                              <dt>{a.portfolio}</dt>
                              <dd>{app.portfolioUrl || student.portfolioUrl}</dd>
                            </div>
                          )}
                        </dl>
                        <div>
                          <p className="eyebrow" style={{ marginBottom: 10 }}>
                            {a.history}
                          </p>
                          <Timeline application={app} viewer="startup" />
                        </div>
                      </div>
                    )}

                    <div className="applicant-foot">
                      <button
                        type="button"
                        className="link-arrow"
                        aria-expanded={expanded}
                        onClick={() => setOpen(expanded ? null : app.id)}
                      >
                        {expanded ? t.actions.close : t.listing.viewDetails}
                        <ChevronDown size={14} aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
                      </button>
                      <div className="row-wrap">
                        {app.status === 'offer' && <span className="small muted">{a.waitingStudent}</span>}
                        {actions.map((action) => (
                          <Button
                            key={action}
                            size="sm"
                            variant={action === 'reject' ? 'ghost' : action === actions[0] ? 'primary' : 'secondary'}
                            onClick={() => setDialog({ action, application: app })}
                          >
                            {a.actions[action]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {dialog && (
        <ActionDialog
          action={dialog.action}
          application={dialog.application}
          defaultInterviewer={listing.supervisorName || startup.contactName}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
