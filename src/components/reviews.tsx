import { BadgeCheck, Star } from 'lucide-react';
import { formatMonthYear } from '../domain/dates';
import type { Review } from '../domain/types';
import { useSession } from '../data/selectors';
import { useT } from '../i18n';
import { Tooltip } from './ui';

export function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span className="stars" role="img" aria-label={`${label ? `${label}: ` : ''}${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} aria-hidden="true" fill={n <= value ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

/**
 * Reviews are shown without the student's name. Each one is tied to an
 * application the startup marked as completed (enforced in submitReview).
 */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  const t = useT();
  const c = t.pub.company;
  const { db } = useSession();
  return (
    <ul className="review-list">
      {reviews.map((r) => {
        const listing = db.listings.find((l) => l.id === r.listingId);
        return (
          <li key={r.id} className="review">
            <div className="spread">
              <Stars value={r.rating} label={c.rating} />
              <Tooltip text={t.trust.confirmedReviewHelp} align="end">
                <span className="badge badge-verified">
                  <BadgeCheck size={15} aria-hidden="true" />
                  {t.trust.confirmedReview}
                </span>
              </Tooltip>
            </div>
            <p className="review-body">{r.body}</p>
            <div className="row-wrap small muted">
              <span>
                {c.meaningful}: {r.meaningfulWork}/5
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {c.mentorship}: {r.mentorship}/5
              </span>
            </div>
            <p className="small muted">
              {listing ? c.reviewedRole(listing.title) : ''} · {formatMonthYear(r.createdAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
