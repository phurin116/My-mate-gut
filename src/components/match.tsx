import { Check, CircleDashed, Minus } from 'lucide-react';
import type { SkillId } from '../domain/catalog';
import type { CriterionResult, MatchResult } from '../domain/matching';
import type { Listing, Startup, Student } from '../domain/types';
import type { Dictionary } from '../i18n';
import { useT } from '../i18n';

interface Ctx {
  student: Student;
  listing: Listing;
  startup: Startup | undefined;
}

const skillLabel = (t: Dictionary, id: string) => t.skills[id as SkillId] ?? id;

/** One plain-language sentence for a single criterion's outcome. */
export function explainCriterion(t: Dictionary, c: CriterionResult, { student, listing, startup }: Ctx): string {
  const e = t.match.explain;
  const field = t.fields[listing.field];
  const major = student.major ? t.majors[student.major] : '';
  const industry = startup ? t.industries[startup.industry] : '';
  const mode = t.workModes[listing.workMode];
  switch (c.id) {
    case 'interest':
      return c.outcome === 'met' ? e.interestMet(field) : e.interestUnmet(field);
    case 'major':
      return c.outcome === 'met'
        ? e.majorMet(major, field)
        : c.outcome === 'partial'
          ? e.majorPartial(major, field)
          : e.majorUnmet(major, field);
    case 'skills': {
      const have = c.detail.matchedSkills?.length ?? 0;
      const missing = c.detail.missingSkills ?? [];
      const base = e.skills(have, have + missing.length);
      return missing.length ? `${base} ${e.skillsMissing(missing.map((s) => skillLabel(t, s)))}` : base;
    }
    case 'goal':
      return c.outcome === 'met'
        ? e.goalMet(field)
        : e.goalUnmet(student.careerGoal ? t.fields[student.careerGoal] : '');
    case 'industry':
      return c.outcome === 'met' ? e.industryMet(industry) : e.industryUnmet(industry);
    case 'eligibility':
      if (c.detail.needsExperience) return e.needsExperience;
      if (c.detail.belowMinYear) return e.belowMinYear(listing.minYear);
      return listing.noExperienceRequired ? e.eligibilityMetBeginner : e.eligibilityMet;
    case 'workMode':
      return c.outcome === 'met' ? e.workModeMet(mode) : e.workModeUnmet(mode);
    case 'pay':
      return c.outcome === 'met' ? e.payMet : e.payUnmet;
    case 'duration':
      return c.outcome === 'met'
        ? e.durationMet(listing.durationMonths)
        : e.durationUnmet(listing.durationMonths, student.prefs.maxDurationMonths ?? 0);
  }
}

/**
 * "Recommended because you are interested in marketing, have communication
 * skills and meet all beginner requirements." Built only from criteria that
 * were actually met, strongest first.
 */
export function reasonSentence(t: Dictionary, match: MatchResult, { student, listing, startup }: Ctx): string | null {
  const r = t.match.reasons;
  const met = match.criteria.filter((c) => c.outcome !== 'unmet').sort((a, b) => b.earned - a.earned);
  const clauses: string[] = [];
  for (const c of met) {
    if (clauses.length === 3) break;
    switch (c.id) {
      case 'interest':
        clauses.push(r.interest(t.fields[listing.field]));
        break;
      case 'skills': {
        const skills = (c.detail.matchedSkills ?? []).slice(0, 2).map((s) => skillLabel(t, s));
        if (skills.length) clauses.push(r.skills(skills));
        break;
      }
      case 'eligibility':
        clauses.push(listing.noExperienceRequired ? r.eligibilityBeginner : r.eligibility);
        break;
      case 'major':
        if (c.outcome === 'met' && student.major) clauses.push(r.major(t.majors[student.major]));
        break;
      case 'goal':
        clauses.push(r.goal(t.fields[listing.field]));
        break;
      case 'industry':
        if (startup) clauses.push(r.industry(t.industries[startup.industry]));
        break;
      case 'workMode':
        clauses.push(r.workMode(t.workModes[listing.workMode]));
        break;
      case 'pay':
        clauses.push(r.pay);
        break;
      case 'duration':
        clauses.push(r.duration);
        break;
    }
  }
  if (clauses.length === 0) return null;
  const joined =
    clauses.length === 1
      ? clauses[0]
      : `${clauses.slice(0, -1).join(', ')} and ${clauses[clauses.length - 1]}`;
  return `${t.match.recommendedBecause} ${joined}.`;
}

/** Circular score indicator. Only rendered when a real score exists. */
export function MatchRing({ score, size = 44 }: { score: number; size?: number }) {
  const t = useT();
  const stroke = size >= 64 ? 6 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = score >= 75 ? 'var(--brand-mid)' : score >= 50 ? '#a8842c' : '#a9ada5';
  return (
    <span className="match-ring" style={{ width: size, height: size }} role="img" aria-label={t.listing.matchAria(score)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="match-ring-value" style={{ fontSize: size >= 64 ? '1.25rem' : score === 100 ? '0.6875rem' : '0.8125rem' }} aria-hidden="true">
        {score}
        <small>%</small>
      </span>
    </span>
  );
}

/** Full, transparent breakdown: every criterion, its outcome and its points. */
export function MatchBreakdown({ match, ctx }: { match: MatchResult; ctx: Ctx }) {
  const t = useT();
  const sorted = [...match.criteria].sort((a, b) => b.weight - a.weight);
  return (
    <div>
      <ul className="criteria">
        {sorted.map((c) => {
          const Icon = c.outcome === 'met' ? Check : c.outcome === 'partial' ? CircleDashed : Minus;
          return (
            <li key={c.id} className={`criterion is-${c.outcome}`}>
              <span className="criterion-icon" aria-hidden="true">
                <Icon size={14} />
              </span>
              <div className="grow">
                <div className="spread">
                  <span className="criterion-name">{t.match.criteria[c.id]}</span>
                  <span className="criterion-points">{t.match.points(Math.round(c.earned), c.weight)}</span>
                </div>
                <p className="small muted">{explainCriterion(t, c, ctx)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="small muted" style={{ marginTop: 12 }}>
        {t.match.basedOn(match.criteria.length)}. {t.match.method}
      </p>
    </div>
  );
}
