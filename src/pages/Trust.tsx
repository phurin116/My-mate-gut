import { BadgeCheck, Check, Flag, FlaskConical } from 'lucide-react';
import { LISTING_CHECKS, STARTUP_CHECKS } from '../domain/catalog';
import { TrustBadge } from '../components/trust';
import { ButtonLink, PageHead } from '../components/ui';
import { useT } from '../i18n';

export default function Trust() {
  const t = useT();
  const p = t.pub.trustPage;
  return (
    <div className="container container-narrow page">
      <PageHead eyebrow={p.eyebrow} title={p.title} lead={p.lead} />

      <section className="detail-section">
        <h2>{p.labelsTitle}</h2>
        <ul className="label-list">
          {(['verified', 'pending', 'unverified'] as const).map((s) => (
            <li key={s} className="card card-pad">
              <TrustBadge status={s} kind="listing" showTip={false} />
              <p className="muted">{p.labels[s].body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section two-col">
        <div className="card card-pad">
          <h2 className="card-title">{p.companyChecks}</h2>
          <ul className="checklist" style={{ marginTop: 8 }}>
            {STARTUP_CHECKS.map((id) => (
              <li key={id}>
                <Check size={16} aria-hidden="true" />
                <span>{t.trust.checks[id]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card card-pad">
          <h2 className="card-title">{p.listingChecks}</h2>
          <ul className="checklist" style={{ marginTop: 8 }}>
            {LISTING_CHECKS.map((id) => (
              <li key={id}>
                <Check size={16} aria-hidden="true" />
                <span>{t.trust.checks[id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="detail-section">
        <h2>{p.ongoingTitle}</h2>
        <ul className="bullets">
          {p.ongoing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2 className="row">
          <BadgeCheck size={20} aria-hidden="true" style={{ color: 'var(--green)' }} />
          {p.reviewsTitle}
        </h2>
        <p>{p.reviewsBody}</p>
      </section>

      <section className="detail-section">
        <h2 className="row">
          <Flag size={18} aria-hidden="true" style={{ color: 'var(--clay)' }} />
          {p.reportTitle}
        </h2>
        <p>{p.reportBody}</p>
      </section>

      <div className="notice notice-info">
        <FlaskConical size={18} aria-hidden="true" />
        <div>
          <strong>{p.demoTitle}</strong>
          <p>{p.demoBody}</p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <ButtonLink to="/internships?verified=1" variant="primary">
          {p.cta}
        </ButtonLink>
      </div>
    </div>
  );
}
