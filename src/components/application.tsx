import { Link } from 'react-router';
import { Check, ChevronRight, X } from 'lucide-react';
import { formatDate, formatDateTime } from '../domain/dates';
import type { Application, ApplicationStatus } from '../domain/types';
import { useSession } from '../data/selectors';
import { useT } from '../i18n';
import { StatusPill } from './trust';
import { CompanyLogo } from './CompanyLogo';

/** One application as a link row: role, company, status and last update. */
export function ApplicationRow({ application, compact }: { application: Application; compact?: boolean }) {
  const t = useT();
  const { db } = useSession();
  const listing = db.listings.find((l) => l.id === application.listingId);
  const startup = db.startups.find((s) => s.id === application.startupId);
  return (
    <Link
      to={application.status === 'draft' ? `/internships/${application.listingId}/apply` : `/applications/${application.id}`}
      className={`app-row${compact ? ' is-compact' : ''}`}
    >
      {startup && <CompanyLogo company={startup} size={compact ? 32 : 44} />}
      <span className="grow">
        <span className="app-row-title truncate">{listing?.title}</span>
        <span className="small muted truncate" style={{ display: 'block' }}>
          {startup?.name}
          {!compact && application.status !== 'draft' && ` · ${t.stu.applications.appliedOn(formatDate(application.appliedAt))}`}
        </span>
        {!compact && <span className="app-row-next small">{t.stu.application.next[application.status]}</span>}
      </span>
      <span className="app-row-status">
        <StatusPill status={application.status} />
        {!compact && (
          <span className="small muted">{t.stu.applications.updatedOn(formatDate(application.updatedAt))}</span>
        )}
      </span>
      <ChevronRight size={16} aria-hidden="true" className="app-row-chevron" />
    </Link>
  );
}

const PIPELINE: ApplicationStatus[] = ['submitted', 'in_review', 'interview', 'offer'];
const ENDED: ApplicationStatus[] = ['rejected', 'withdrawn', 'declined', 'completed', 'accepted'];
const NEGATIVE: ApplicationStatus[] = ['rejected', 'withdrawn', 'declined'];

/**
 * Timeline of what has happened (from recorded events) followed by the steps
 * still ahead, so a student always sees where they are in the process.
 */
export function Timeline({ application, viewer }: { application: Application; viewer: 'student' | 'startup' }) {
  const t = useT();
  const a = t.stu.application;
  const { db } = useSession();
  const startup = db.startups.find((s) => s.id === application.startupId);
  const student = db.students.find((s) => s.id === application.studentId);
  const reached = new Set(application.events.map((e) => e.status));
  const ended = ENDED.includes(application.status);
  const upcoming = ended ? [] : PIPELINE.filter((s) => !reached.has(s) && PIPELINE.indexOf(s) > PIPELINE.indexOf(application.status));

  return (
    <ol className="timeline">
      {application.events.map((e, i) => {
        const current = i === application.events.length - 1;
        const negative = NEGATIVE.includes(e.status);
        const who =
          e.actor === 'student' ? (viewer === 'student' ? a.byYou : (student?.name ?? '')) : (startup?.name ?? '');
        return (
          <li key={e.at + e.status} className={`timeline-item is-done${current ? ' is-current' : ''}${negative ? ' is-negative' : ''}`}>
            <span className="timeline-dot" aria-hidden="true">
              {negative ? <X size={12} /> : <Check size={12} />}
            </span>
            <div>
              <p className="timeline-title">{t.status[e.status]}</p>
              <p className="small muted">
                {formatDateTime(e.at)} · {who}
              </p>
              {e.message && <p className="timeline-message">{e.message}</p>}
            </div>
          </li>
        );
      })}
      {upcoming.map((s) => (
        <li key={s} className="timeline-item is-upcoming">
          <span className="timeline-dot" aria-hidden="true" />
          <div>
            <p className="timeline-title">{s === 'offer' ? a.stepDecision : t.status[s]}</p>
            <p className="small muted">{a.upcoming}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
