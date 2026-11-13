import { en } from './en';

/**
 * Localisation entry point.
 *
 * All interface text lives in dictionaries under src/i18n/<locale>/ and is
 * read through `useT()` in components or `dict()` outside React.
 * To add Thai: create src/i18n/th/ exporting an object of type `Dictionary`,
 * register it in `dictionaries`, and call `setLocale('th')` from a language
 * switcher. Dates and numbers already format through Intl (see domain/dates.ts).
 */

export type Dictionary = typeof en;
export type Locale = 'en';

const dictionaries: Record<Locale, Dictionary> = { en };
let current: Locale = 'en';

export function setLocale(locale: Locale) {
  current = locale;
  document.documentElement.lang = locale;
}

export function dict(): Dictionary {
  return dictionaries[current];
}

/** Hook form, so components re-read the dictionary if locale switching is added. */
export function useT(): Dictionary {
  return dictionaries[current];
}
