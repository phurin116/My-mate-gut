import { Link } from 'react-router';
import { Briefcase, MapPin } from 'lucide-react';
import type { Startup } from '../domain/types';
import { companyOpenListings, startupStatus, useSession } from '../data/selectors';
import { useT } from '../i18n';
import { CompanyLogo } from './CompanyLogo';
import { TrustBadge } from './trust';
import { DemoTag } from './ui';

/** Company summary card. The whole card links to the company profile. */
export function CompanyCard({ company, compact }: { company: Startup; compact?: boolean }) {
  const t = useT();
  const { db } = useSession();
  const open = companyOpenListings(db, company.id).length;
  return (
    <article className={`ccard${compact ? ' is-compact' : ''}`}>
      <div className="ccard-top">
        <CompanyLogo company={company} size={compact ? 44 : 52} />
        <div className="grow">
          <h3 className="ccard-name">
            <Link to={`/companies/${company.id}`}>{company.name}</Link>
          </h3>
          <p className="small muted">
            {t.industries[company.industry]} · {t.companyKinds[company.kind]}
          </p>
        </div>
      </div>
      {!compact && <p className="ccard-tagline">{company.tagline}</p>}
      <div className="ccard-meta">
        <span>
          <MapPin size={14} aria-hidden="true" />
          {company.district}
        </span>
        <span className={open ? 'ccard-roles' : ''}>
          <Briefcase size={14} aria-hidden="true" />
          {t.pub.home.roles(open)}
        </span>
      </div>
      {!compact && (
        <div className="ccard-foot">
          <TrustBadge status={startupStatus(db, company.id)} kind="company" />
          {company.isDemo && <DemoTag />}
        </div>
      )}
    </article>
  );
}
