import { useNavigate, useSearchParams } from 'react-router';
import { Bell, Bookmark, BriefcaseBusiness, FileText, ShieldCheck, Star } from 'lucide-react';
import { formatDateTime } from '../../domain/dates';
import type { Listing, Notification } from '../../domain/types';
import { ApplicationRow } from '../../components/application';
import { InternshipCard } from '../../components/listing';
import { Button, ButtonLink, EmptyState, PageHead, useToast } from '../../components/ui';
import { markAllRead, markRead } from '../../data/actions';
import { isActive, isOpen, useSession } from '../../data/selectors';
import { useT } from '../../i18n';

export function Saved() {
  const t = useT();
  const s = t.stu.saved;
  const { db, student } = useSession();
  if (!student) return null;
  const listings = db.saved
    .filter((x) => x.studentId === student.id)
    .map((x) => db.listings.find((l) => l.id === x.listingId))
    .filter((l): l is Listing => !!l)
    // Open roles first, soonest deadline first.
    .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline));

  return (
    <div className="container page">
      <PageHead title={s.title} lead={s.lead} />
      {listings.length === 0 ? (
        <EmptyState icon={<Bookmark size={22} />} title={s.emptyTitle} body={s.emptyBody}>
          <ButtonLink to="/internships" variant="primary">
            {t.notFound.cta}
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <p className="muted small" style={{ marginBottom: 12 }}>
            {s.count(listings.length)}
            {listings.some((l) => !isOpen(l)) ? `. ${s.closedNote}` : ''}
          </p>
          <div className="card-grid">
            {listings.map((l) => (
              <InternshipCard key={l.id} listing={l} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Applications() {
  const t = useT();
  const a = t.stu.applications;
  const [params, setParams] = useSearchParams();
  const { db, student } = useSession();
  if (!student) return null;
  const tabParam = params.get('tab');
  const tab = tabParam === 'past' || tabParam === 'drafts' ? tabParam : 'active';
  const all = db.applications
    .filter((x) => x.studentId === student.id)
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  const drafts = all.filter((x) => x.status === 'draft');
  const active = all.filter(isActive);
  const past = all.filter((x) => !isActive(x) && x.status !== 'draft');
  const shown = tab === 'active' ? active : tab === 'drafts' ? drafts : past;

  return (
    <div className="container page">
      <PageHead title={a.title} lead={a.lead} />
      <p className="small muted demo-line">{a.demoNote}</p>
      <div className="tabs" role="tablist" style={{ marginBottom: 16 }}>
        {(
          [
            ['active', a.tabActive, active.length],
            ['drafts', a.tabDrafts, drafts.length],
            ['past', a.tabPast, past.length],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="tab"
            onClick={() => setParams(id === 'active' ? {} : { tab: id }, { replace: true })}
          >
            {label} <span className="count">{n}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title={tab === 'active' ? a.emptyActiveTitle : tab === 'drafts' ? a.emptyDraftsTitle : a.emptyPastTitle}
          body={tab === 'active' ? a.emptyActiveBody : tab === 'drafts' ? a.emptyDraftsBody : a.emptyPastBody}
        >
          {tab === 'active' && (
            <ButtonLink to="/internships" variant="primary">
              {t.notFound.cta}
            </ButtonLink>
          )}
        </EmptyState>
      ) : (
        <ul className="card app-list">
          {shown.map((x) => (
            <li key={x.id}>
              <ApplicationRow application={x} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const KIND_ICONS: Record<Notification['kind'], typeof Bell> = {
  application: FileText,
  verification: ShieldCheck,
  listing: BriefcaseBusiness,
  review: Star,
  system: Bell,
};

/** Shared by every role. */
export function Notifications() {
  const t = useT();
  const n = t.stu.notifications;
  const toast = useToast();
  const navigate = useNavigate();
  const { db, user } = useSession();
  if (!user) return null;
  const items = db.notifications
    .filter((x) => x.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = items.filter((x) => !x.read).length;

  return (
    <div className="container container-narrow page">
      <PageHead
        title={n.title}
        lead={n.lead}
        actions={
          unread > 0 ? (
            <Button
              size="sm"
              onClick={() => {
                markAllRead(user.id);
                toast(n.allRead);
              }}
            >
              {n.markAll}
            </Button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={<Bell size={22} />} title={n.emptyTitle} body={n.emptyBody} />
      ) : (
        <ul className="card notif-list">
          {items.map((item) => {
            const Icon = KIND_ICONS[item.kind];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`notif${item.read ? '' : ' is-unread'}`}
                  onClick={() => {
                    markRead(item.id);
                    navigate(item.link);
                  }}
                >
                  <span className="attention-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="grow">
                    <span className="notif-title">
                      {!item.read && <span className="sr-only">{n.unread}: </span>}
                      {item.title}
                    </span>
                    {item.body && <span className="small muted notif-body">{item.body}</span>}
                    <span className="small muted">{formatDateTime(item.createdAt)}</span>
                  </span>
                  {!item.read && <span className="notif-dot" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
