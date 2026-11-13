import { MAJOR_FIELDS } from './catalog';
import type { Listing, Startup, Student } from './types';

/**
 * Rule-based internship matching.
 *
 * This is deliberately a transparent points system, not machine learning.
 * Every criterion below is shown to the student with its outcome, and the
 * percentage is simply points earned divided by points available.
 * A criterion is skipped (and not counted) when the student has not provided
 * the information it needs, so an incomplete profile never inflates a score.
 */

export type CriterionId =
  | 'interest'
  | 'major'
  | 'skills'
  | 'goal'
  | 'industry'
  | 'eligibility'
  | 'workMode'
  | 'pay'
  | 'duration';

export type Outcome = 'met' | 'partial' | 'unmet';

export interface CriterionResult {
  id: CriterionId;
  weight: number;
  earned: number;
  outcome: Outcome;
  /** Extra facts the UI needs to phrase the explanation. */
  detail: {
    matchedSkills?: string[];
    missingSkills?: string[];
    needsExperience?: boolean;
    belowMinYear?: boolean;
  };
}

export interface MatchResult {
  /** 0 to 100, or null when the profile has too little information to score. */
  score: number | null;
  criteria: CriterionResult[];
  /** False when the student does not meet a hard requirement of the listing. */
  eligible: boolean;
}

export const WEIGHTS: Record<CriterionId, number> = {
  skills: 25,
  interest: 15,
  eligibility: 15,
  major: 10,
  goal: 10,
  industry: 10,
  workMode: 6,
  duration: 5,
  pay: 4,
};

/** Minimum number of scored criteria before a percentage is shown. */
export const MIN_CRITERIA = 4;

function result(
  id: CriterionId,
  fraction: number,
  detail: CriterionResult['detail'] = {},
): CriterionResult {
  const weight = WEIGHTS[id];
  const outcome: Outcome = fraction >= 0.999 ? 'met' : fraction > 0 ? 'partial' : 'unmet';
  return { id, weight, earned: weight * fraction, outcome, detail };
}

export function matchListing(student: Student, listing: Listing, startup: Startup | undefined): MatchResult {
  const criteria: CriterionResult[] = [];

  if (student.interests.length > 0) {
    criteria.push(result('interest', student.interests.includes(listing.field) ? 1 : 0));
  }

  if (student.major && student.major !== 'other') {
    const related = MAJOR_FIELDS[student.major];
    const idx = related.indexOf(listing.field);
    criteria.push(result('major', idx === 0 ? 1 : idx > 0 ? 0.6 : 0));
  }

  if (student.skills.length > 0 && listing.skills.length > 0) {
    const matched = listing.skills.filter((s) => student.skills.includes(s));
    const missing = listing.skills.filter((s) => !student.skills.includes(s));
    criteria.push(
      result('skills', matched.length / listing.skills.length, { matchedSkills: matched, missingSkills: missing }),
    );
  }

  if (student.careerGoal) {
    criteria.push(result('goal', student.careerGoal === listing.field ? 1 : 0));
  }

  if (student.industries.length > 0 && startup) {
    criteria.push(result('industry', student.industries.includes(startup.industry) ? 1 : 0));
  }

  let eligible = true;
  if (student.experience && student.year) {
    const needsExperience = !listing.noExperienceRequired && student.experience === 'none';
    const belowMinYear = student.year < listing.minYear;
    eligible = !needsExperience && !belowMinYear;
    criteria.push(result('eligibility', eligible ? 1 : 0, { needsExperience, belowMinYear }));
  }

  if (student.prefs.workModes.length > 0) {
    criteria.push(result('workMode', student.prefs.workModes.includes(listing.workMode) ? 1 : 0));
  }

  if (student.prefs.maxDurationMonths) {
    criteria.push(result('duration', listing.durationMonths <= student.prefs.maxDurationMonths ? 1 : 0));
  }

  if (student.prefs.paidOnly) {
    criteria.push(result('pay', listing.paid ? 1 : 0));
  }

  if (criteria.length < MIN_CRITERIA) {
    return { score: null, criteria, eligible };
  }

  const possible = criteria.reduce((sum, c) => sum + c.weight, 0);
  const earned = criteria.reduce((sum, c) => sum + c.earned, 0);
  return { score: Math.round((earned / possible) * 100), criteria, eligible };
}

/** A listing is recommended when the student is eligible and the score clears this bar. */
export const RECOMMEND_THRESHOLD = 60;

export function isRecommended(match: MatchResult): boolean {
  return match.eligible && match.score !== null && match.score >= RECOMMEND_THRESHOLD;
}

/** Share of profile fields that feed the matching rules, used for the profile progress meter. */
export function profileCompleteness(student: Student): { done: number; total: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['university', !!student.universityId],
    ['major', !!student.major],
    ['year', !!student.year],
    ['skills', student.skills.length > 0],
    ['interests', student.interests.length > 0],
    ['careerGoal', !!student.careerGoal],
    ['experience', !!student.experience],
    ['industries', student.industries.length > 0],
    ['workModes', student.prefs.workModes.length > 0],
  ];
  return {
    done: checks.filter(([, ok]) => ok).length,
    total: checks.length,
    missing: checks.filter(([, ok]) => !ok).map(([k]) => k),
  };
}
